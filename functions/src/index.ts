import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore as getDB, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getDB();

export const onRequestApproved = onDocumentUpdated(
  "solicitudes/{requestId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    // 🔍 Verificar el campo correcto: "status"
    const beforeStatus = before.status;
    const afterStatus = after.status;

    // Solo ejecutar cuando cambia de "pending" o "rejected" a "approved"
    // O anteriormente era null/false (por compatibilidad, aunque no debería ocurrir con los cambios actuales)
    const justApproved =
      (beforeStatus !== "approved") &&
      afterStatus === "approved";

    if (!justApproved) return;

    // Evitar ejecución múltiple
    if (after.processed === true) {
      console.log("Solicitud ya procesada, no volver a ejecutar.");
      return;
    }

    const { userId, tipoPermiso, diasSolicitados } = after;

    if (!userId || !tipoPermiso || !diasSolicitados) {
      console.error("Datos faltantes en la solicitud:", after);
      return;
    }

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.error("Usuario no encontrado:", userId);
      return;
    }

    const userData = userSnap.data() || {};
    const updateFields: Record<string, number> = {};

    // 📋 Mapeo de tipos de permiso según tu lógica
    switch (tipoPermiso) {
      case "Vacaciones": {
        const used = userData.vacationUsedInDays || 0;
        updateFields.vacationUsedInDays = used + diasSolicitados;
        break;
      }

      case "Permiso Médico":
      case "Administrativo": {
        // ✅ Descontar de administrativeDays
        const remaining = userData.administrativeDays ?? 0;
        const newRemaining = Math.max(remaining - diasSolicitados, 0);
        updateFields.administrativeDays = newRemaining;
        break;
      }

      default:
        console.log("Tipo de permiso sin impacto en saldo:", tipoPermiso);
        break;
    }

    // 💾 Actualizar saldo del usuario
    if (Object.keys(updateFields).length > 0) {
      await userRef.update(updateFields);
      console.log(`Saldo actualizado para usuario ${userId}:`, updateFields);
    }

    // ✅ Marcar solicitud como procesada
    await event.data?.after?.ref.set(
      {
        processed: true,
        processedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    console.log("Solicitud procesada correctamente ✔️");
  }
);

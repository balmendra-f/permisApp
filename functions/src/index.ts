import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore as getDB, FieldValue } from "firebase-admin/firestore";

initializeApp();
const db = getDB();

export const onRequestApproved = onDocumentUpdated(
  "requests/{requestId}",
  async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();
    if (!before || !after) return;

    // Soporta ambas variantes: approved / aproved
    const beforeApproval = before.approved ?? before.aproved;
    const afterApproval = after.approved ?? after.aproved;

    // Cambió de falso a verdadero → recién aprobado
    const justApproved = beforeApproval === false && afterApproval === true;
    if (!justApproved) return;

    // Evitar ejecución múltiple
    if (after.processed === true) {
      console.log("Solicitud ya procesada, no volver a ejecutar.");
      return;
    }

    const { userId, tipoPermiso, fechaInicio, fechaFin } = after;
    if (!userId || !tipoPermiso || !fechaInicio || !fechaFin) {
      console.error("Datos faltantes en la solicitud:", after);
      return;
    }

    // Cálculo de días solicitados (incluye ambos extremos)
    const diasSolicitados =
      Math.ceil(
        Math.abs(fechaFin.toDate().getTime() - fechaInicio.toDate().getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      console.error("Usuario no encontrado:", userId);
      return;
    }

    const userData = userSnap.data() || {};
    const updateFields: Record<string, number> = {};

    switch (tipoPermiso) {
      case "Vacaciones": {
        const used = userData.vacationUsedInDays || 0;
        updateFields.vacationUsedInDays = used + diasSolicitados;
        break;
      }

      case "Administrativo": {
        const remaining = userData.administrativeDays ?? 0;
        const newRemaining = Math.max(remaining - diasSolicitados, 0);
        updateFields.administrativeDays = newRemaining;
        break;
      }

      default:
        console.log("Tipo de permiso sin impacto en saldo:", tipoPermiso);
        break;
    }

    if (Object.keys(updateFields).length > 0) {
      await userRef.update(updateFields);
      console.log(`Saldo actualizado para usuario ${userId}:`, updateFields);
    }

    // Marcar solicitud procesada
    await event.data?.after?.ref.update({
      processed: true,
      processedAt: FieldValue.serverTimestamp(),
    });

    console.log("Solicitud procesada correctamente ✔️");
  }
);

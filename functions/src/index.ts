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

    const justApproved = before.approved === false && after.approved === true;
    if (!justApproved) return;

    const { userId, tipoPermiso, fechaInicio, fechaFin } = after;

    if (!userId || !tipoPermiso || !fechaInicio || !fechaFin) {
      console.error("Datos incompletos en la solicitud:", after);
      return;
    }

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
    const updates: Record<string, any> = {};

    if (tipoPermiso === "Vacaciones") {
      const used = userData.vacationUsedInDays || 0;
      updates.vacationUsedInDays = used + diasSolicitados;
    } else if (tipoPermiso === "Administrativo") {
      const remaining = userData.administrativeDays || 0;
      updates.administrativeDays = Math.max(remaining - diasSolicitados, 0);
    } else {
      console.log("Tipo de permiso no requiere descuento:", tipoPermiso);
      return;
    }

    await userRef.update(updates);

    console.log(`Días actualizados para usuario ${userId}:`, updates);

    await event.data?.after?.ref.update({
      processed: true,
      processedAt: FieldValue.serverTimestamp(),
    });
  }
);

module.exports = function (data) {
    // Be careful when you indent the email, because whitespaces are visible in emails!
    return `
Hola,

Un suscriptor de pago acaba de cancelar su suscripción: "${data.memberData.name}"

---

Enviado a ${data.toEmail} desde ${data.siteDomain}.
Si ya no quieres recibir estas notificaciones, puedes ajustar tu configuración en ${data.staffUrl}.
    `;
};

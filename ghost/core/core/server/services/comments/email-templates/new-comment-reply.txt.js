module.exports = function (data) {
    // Be careful when you indent the email, because whitespaces are visible in emails!
    return `Hola,

Alguien respondió a tu comentario sobre "${data.postTitle}"

${data.postUrl}#ghost-comments

---

Enviado a ${data.toEmail} de ${data.siteDomain}.
Puedes darte de baja de estas notificaciones en ${data.profileUrl}.`;
};

module.exports = function (data) {
    // Be careful when you indent the email, because whitespaces are visible in emails!
    return `
Hola,

Alguien acaba de publicar un comentario en tu publicación "${data.postTitle}"

${data.postUrl}#ghost-comments

---

Enviado a ${data.toEmail} de ${data.siteDomain}.
Puedes administrar tus preferencias de notificación en ${data.staffUrl}.
    `;
};

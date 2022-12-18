module.exports = function (data) {
    // Be careful when you indent the email, because whitespaces are visible in emails!
    return `Hola,

${data.reporter} ha reportado un comentario en ${data.postTitle}. Este comentario permanecerá visible hasta que elijas eliminarlo, lo que se puede hacer directamente en la publicación.

${data.memberName} (${data.memberEmail}):
${data.commentText}

${data.postUrl}#ghost-comments

---

Enviado a ${data.toEmail} de ${data.siteDomain}.
Puedes administrar tus preferencias de notificación en ${data.staffUrl}.`;
};

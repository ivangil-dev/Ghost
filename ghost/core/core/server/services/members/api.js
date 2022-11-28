const stripeService = require('../stripe');
const settingsCache = require('../../../shared/settings-cache');
const MembersApi = require('@tryghost/members-api');
const logging = require('@tryghost/logging');
const mail = require('../mail');
const models = require('../../models');
const signinEmail = require('./emails/signin');
const signupEmail = require('./emails/signup');
const signupPaidEmail = require('./emails/signup-paid');
const subscribeEmail = require('./emails/subscribe');
const updateEmail = require('./emails/updateEmail');
const SingleUseTokenProvider = require('./SingleUseTokenProvider');
const urlUtils = require('../../../shared/url-utils');
const labsService = require('../../../shared/labs');
const offersService = require('../offers');
const tiersService = require('../tiers');
const newslettersService = require('../newsletters');
const memberAttributionService = require('../member-attribution');
const emailSuppressionList = require('../email-suppression-list');

const MAGIC_LINK_TOKEN_VALIDITY = 24 * 60 * 60 * 1000;

const ghostMailer = new mail.GhostMailer();

module.exports = createApiInstance;

function createApiInstance(config) {
    const membersApiInstance = MembersApi({
        tokenConfig: config.getTokenConfig(),
        auth: {
            getSigninURL: config.getSigninURL.bind(config),
            allowSelfSignup: config.getAllowSelfSignup.bind(config),
            tokenProvider: new SingleUseTokenProvider(models.SingleUseToken, MAGIC_LINK_TOKEN_VALIDITY)
        },
        mail: {
            transporter: {
                sendMail(message) {
                    if (process.env.NODE_ENV !== 'production') {
                        logging.warn(message.text);
                    }
                    let msg = Object.assign({
                        from: config.getAuthEmailFromAddress(),
                        subject: 'Signin',
                        forceTextContent: true
                    }, message);

                    return ghostMailer.send(msg);
                }
            },
            getSubject(type) {
                const siteTitle = settingsCache.get('title');
                switch (type) {
                case 'subscribe':
                    return `📫 Confirma tu suscripción a ${siteTitle}`;
                case 'signup':
                    return `🙌 Completa tu registro en ${siteTitle}!`;
                case 'signup-paid':
                    return `🙌 Gracias por apoyar el proyecto ${siteTitle}!`;
                case 'updateEmail':
                    return `📫 Confirma tu cambio de email en ${siteTitle}!`;
                case 'signin':
                default:
                    return `🔑 Inicio de sesión seguro en ${siteTitle}`;
                }
            },
            getText(url, type, email) {
                const siteTitle = settingsCache.get('title');
                switch (type) {
                case 'subscribe':
                    return `
                        ¡Hola!,

                        Estás a sólo un paso de suscribirte a ${siteTitle} — Sólo falta que confirmes tu dirección de correo electrónico con este enlace:

                        ${url}

                        Por tu seguridad, el enlace caducará en 24 horas.

                        ¡Nos vemos pronto!

                        ---

                        Enviado a ${email}
                        Si te estás preguntando, ¿quien diablos son estos? Es posible que tu no hicieras esta solicitud, no te preocupes. Borra este email y ya está. No te suscribirás a nada.
                        `;
                case 'signup':
                    return `
                        ¡Hola, hola!

                        Toca el enlace a continuación para completar el proceso de registro para ${siteTitle}, cuando lo hagas tu sesión se iniciará automáticamente:

                        ${url}

                        Por tu seguridad, este enlace será devorado por un por un agujero negro en 24 horas y ya nunca más funcionará.

                        ¡Nos vemos pronto!

                        ---

                        Enviado a ${email}
                        Si te estás preguntando, ¿quien diablos son estos? Es posible que tu no hicieras esta solicitud, no te preocupes. Borra este email y ya está. No te suscribirás a nada.
                        `;
                case 'signup-paid':
                    return `
                        ¡Es un placer conocerte!

                        Gracias por suscribirte a ${siteTitle}. Toca el enlace a continuación para que se inicie tu sesión automáticamente:
                        ${url}

                        Por tu seguridad, este enlace será devorado por un por un agujero negro en 24 horas y ya nunca más funcionará.

                        ¡Nos vemos!

                        ---

                        Enviado a ${email}
                        Gracias por apuntarte y apoyar el proyecto ${siteTitle}!
                        `;
                case 'updateEmail':
                    return `
                            ¡Hola!,

                            Confirma el cambio de tu dirección de correo electrónico con este enlace:
                            ${url}

                            Por tu seguridad, el enlace caducará en 24 horas.

                            ---

                            Enviado a ${email}
                            Si no has pedido cambiar tu email, simplemente puedes eliminar este mensaje. Se mantendrá tu email y esta dirección de correo electrónico no se utilizará.
                            `;
                case 'signin':
                default:
                    return `
                        ¡Hola!,

                        Bienvenid@ de nuevo! Usa este enlace para iniciar sesión de forma segura y sin contraseña en tu cuenta de ${siteTitle}:
                        ${url}

                        Por tu seguridad, este enlace será devorado por un por un agujero negro en 24 horas y ya nunca más funcionará.

                        ¡Seguimos en contacto!

                        ---

                        Enviado a ${email}
                        Si no has intentado iniciar sesión no te preocupes, sin tu email no pueden entrar, ignora este email y seguirás a salvo.
                        `;
                }
            },
            getHTML(url, type, email) {
                const siteTitle = settingsCache.get('title');
                const siteUrl = urlUtils.urlFor('home', true);
                const domain = urlUtils.urlFor('home', true).match(new RegExp('^https?://([^/:?#]+)(?:[/:?#]|$)', 'i'));
                const siteDomain = (domain && domain[1]);
                const accentColor = settingsCache.get('accent_color');
                switch (type) {
                case 'subscribe':
                    return subscribeEmail({url, email, siteTitle, accentColor, siteDomain, siteUrl});
                case 'signup':
                    return signupEmail({url, email, siteTitle, accentColor, siteDomain, siteUrl});
                case 'signup-paid':
                    return signupPaidEmail({url, email, siteTitle, accentColor, siteDomain, siteUrl});
                case 'updateEmail':
                    return updateEmail({url, email, siteTitle, accentColor, siteDomain, siteUrl});
                case 'signin':
                default:
                    return signinEmail({url, email, siteTitle, accentColor, siteDomain, siteUrl});
                }
            }
        },
        models: {
            EmailRecipient: models.EmailRecipient,
            StripeCustomer: models.MemberStripeCustomer,
            StripeCustomerSubscription: models.StripeCustomerSubscription,
            Member: models.Member,
            MemberNewsletter: models.MemberNewsletter,
            MemberCancelEvent: models.MemberCancelEvent,
            MemberSubscribeEvent: models.MemberSubscribeEvent,
            MemberPaidSubscriptionEvent: models.MemberPaidSubscriptionEvent,
            MemberLoginEvent: models.MemberLoginEvent,
            MemberEmailChangeEvent: models.MemberEmailChangeEvent,
            MemberPaymentEvent: models.MemberPaymentEvent,
            MemberStatusEvent: models.MemberStatusEvent,
            MemberProductEvent: models.MemberProductEvent,
            MemberCreatedEvent: models.MemberCreatedEvent,
            SubscriptionCreatedEvent: models.SubscriptionCreatedEvent,
            MemberLinkClickEvent: models.MemberClickEvent,
            OfferRedemption: models.OfferRedemption,
            Offer: models.Offer,
            StripeProduct: models.StripeProduct,
            StripePrice: models.StripePrice,
            Product: models.Product,
            Settings: models.Settings,
            Comment: models.Comment,
            MemberFeedback: models.MemberFeedback
        },
        stripeAPIService: stripeService.api,
        tiersService: tiersService,
        offersAPI: offersService.api,
        labsService: labsService,
        newslettersService: newslettersService,
        memberAttributionService: memberAttributionService.service,
        emailSuppressionList
    });

    return membersApiInstance;
}

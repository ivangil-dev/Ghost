const {promises: fs, readFileSync} = require('fs');
const path = require('path');
const moment = require('moment');
const glob = require('glob');

class StaffServiceEmails {
    constructor({logging, models, mailer, settingsHelpers, settingsCache, urlUtils}) {
        this.logging = logging;
        this.models = models;
        this.mailer = mailer;
        this.settingsHelpers = settingsHelpers;
        this.settingsCache = settingsCache;
        this.urlUtils = urlUtils;

        this.Handlebars = require('handlebars');
        this.registerPartials();
    }

    async notifyFreeMemberSignup(member, options) {
        const users = await this.models.User.getEmailAlertUsers('free-signup', options);

        for (const user of users) {
            const to = user.email;
            const memberData = this.getMemberData(member);

            const subject = `🥳 Nuevo suscriptor: ${memberData.name}`;

            const templateData = {
                memberData,
                siteTitle: this.settingsCache.get('title'),
                siteUrl: this.urlUtils.getSiteUrl(),
                siteDomain: this.siteDomain,
                accentColor: this.settingsCache.get('accent_color'),
                fromEmail: this.fromEmailAddress,
                toEmail: to,
                staffUrl: this.urlUtils.urlJoin(this.urlUtils.urlFor('admin', true), '#', `/settings/staff/${user.slug}`)
            };

            const {html, text} = await this.renderEmailTemplate('new-free-signup', templateData);

            await this.sendMail({
                to,
                subject,
                html,
                text
            });
        }
    }

    async notifyPaidSubscriptionStarted({member, subscription, offer, tier}, options = {}) {
        const users = await this.models.User.getEmailAlertUsers('paid-started', options);

        for (const user of users) {
            const to = user.email;
            const memberData = this.getMemberData(member);

            const subject = `💸 Ha empezado una suscripción de pago: ${memberData.name}`;

            const amount = this.getAmount(subscription?.amount);
            const formattedAmount = this.getFormattedAmount({currency: subscription?.currency, amount});
            const interval = subscription?.interval || '';
            const tierData = {
                name: tier?.name || '',
                details: `${formattedAmount}/${interval}`
            };

            const subscriptionData = {
                startedOn: this.getFormattedDate(subscription.startDate)
            };

            let offerData = this.getOfferData(offer);

            const templateData = {
                memberData,
                tierData,
                offerData,
                subscriptionData,
                siteTitle: this.settingsCache.get('title'),
                siteUrl: this.urlUtils.getSiteUrl(),
                siteDomain: this.siteDomain,
                accentColor: this.settingsCache.get('accent_color'),
                fromEmail: this.fromEmailAddress,
                toEmail: to,
                staffUrl: this.urlUtils.urlJoin(this.urlUtils.urlFor('admin', true), '#', `/settings/staff/${user.slug}`)
            };

            const {html, text} = await this.renderEmailTemplate('new-paid-started', templateData);

            await this.sendMail({
                to,
                subject,
                html,
                text
            });
        }
    }

    async notifyPaidSubscriptionCanceled({member, tier, subscription}, options = {}) {
        const users = await this.models.User.getEmailAlertUsers('paid-canceled', options);

        for (const user of users) {
            const to = user.email;
            const memberData = this.getMemberData(member);
            const subject = `⚠️ Cancelación: ${memberData.name}`;

            const amount = this.getAmount(subscription?.amount);
            const formattedAmount = this.getFormattedAmount({currency: subscription?.currency, amount});
            const interval = subscription?.interval;
            const tierDetail = `${formattedAmount}/${interval}`;
            const tierData = {
                name: tier?.name || '',
                details: tierDetail
            };

            const subscriptionData = {
                expiryAt: this.getFormattedDate(subscription.cancelAt),
                canceledAt: this.getFormattedDate(subscription.canceledAt),
                cancellationReason: subscription.cancellationReason || ''
            };

            const templateData = {
                memberData,
                tierData,
                subscriptionData,
                siteTitle: this.settingsCache.get('title'),
                siteUrl: this.urlUtils.getSiteUrl(),
                siteDomain: this.siteDomain,
                accentColor: this.settingsCache.get('accent_color'),
                fromEmail: this.fromEmailAddress,
                toEmail: to,
                staffUrl: this.urlUtils.urlJoin(this.urlUtils.urlFor('admin', true), '#', `/settings/staff/${user.slug}`)
            };

            const {html, text} = await this.renderEmailTemplate('new-paid-cancellation', templateData);

            await this.sendMail({
                to,
                subject,
                html,
                text
            });
        }
    }

    // Utils

    /** @private */
    getMemberData(member) {
        let name = member?.name || member?.email;
        return {
            name,
            email: member?.email,
            showEmail: !!member?.name,
            adminUrl: this.urlUtils.urlJoin(this.urlUtils.urlFor('admin', true), '#', `/members/${member.id}`),
            initials: this.extractInitials(name),
            location: this.getGeolocationData(member.geolocation),
            createdAt: moment(member.created_at).format('D MMM YYYY')
        };
    }

    /** @private */
    getGeolocationData(geolocation) {
        if (!geolocation) {
            return null;
        }

        try {
            const geolocationData = JSON.parse(geolocation);
            return geolocationData?.country || null;
        } catch (e) {
            return null;
        }
    }

    /** @private */
    getFormattedAmount({amount = 0, currency}) {
        if (!currency) {
            return '';
        }

        return Intl.NumberFormat('en', {
            style: 'currency',
            currency,
            currencyDisplay: 'symbol'
        }).format(amount);
    }

    /** @private */
    getAmount(amount) {
        if (!amount) {
            return 0;
        }

        return amount / 100;
    }

    /** @private */
    getFormattedDate(date) {
        if (!date) {
            return '';
        }

        return moment(date).format('D MMM YYYY');
    }

    /** @private */
    getOfferData(offer) {
        if (offer) {
            let offAmount = '';
            let offDuration = '';

            if (offer.duration === 'once') {
                offDuration = ', primer pago';
            } else if (offer.duration === 'repeating') {
                offDuration = `, primeros ${offer.durationInMonths} meses`;
            } else if (offer.duration === 'forever') {
                offDuration = `, para siempre`;
            } else if (offer.duration === 'trial') {
                offDuration = '';
            }
            if (offer.type === 'percent') {
                offAmount = `${offer.amount}% de descuento`;
            } else if (offer.type === 'fixed') {
                const amount = this.getAmount(offer.amount);
                offAmount = `${this.getFormattedAmount({currency: offer.currency, amount})} de descuento`;
            } else if (offer.type === 'trial') {
                offAmount = `${offer.amount} días gratis`;
            }

            return {
                name: offer.name,
                details: `${offAmount}${offDuration}`
            };
        }
    }

    get siteDomain() {
        const [, siteDomain] = this.urlUtils.getSiteUrl()
            .match(new RegExp('^https?://([^/:?#]+)(?:[/:?#]|$)', 'i'));

        return siteDomain;
    }

    get defaultEmailDomain() {
        return this.settingsHelpers.getDefaultEmailDomain();
    }

    get membersAddress() {
        // TODO: get from address of default newsletter?
        return `hola@${this.defaultEmailDomain}`;
    }

    get fromEmailAddress() {
        return `nocontestar@${this.defaultEmailDomain}`;
    }

    extractInitials(name = '') {
        const names = name.split(' ');
        const initials = names.length > 1 ? [names[0][0], names[names.length - 1][0]] : [names[0][0]];
        return initials.join('').toUpperCase();
    }

    async sendMail(message) {
        if (process.env.NODE_ENV !== 'production') {
            this.logging.warn(message.text);
        }

        let msg = Object.assign({
            from: this.fromEmailAddress,
            forceTextContent: true
        }, message);

        return this.mailer.send(msg);
    }

    registerPartials() {
        const rootDirname = './email-templates/partials/';
        const files = glob.sync('*.hbs', {cwd: path.join(__dirname, rootDirname)});
        files.forEach((fileName) => {
            const name = fileName.replace(/.hbs$/, '');
            const filePath = path.join(__dirname, rootDirname, `${name}.hbs`);
            const content = readFileSync(filePath, 'utf8');
            this.Handlebars.registerPartial(name, content);
        });
    }

    async renderEmailTemplate(templateName, data) {
        const htmlTemplateSource = await fs.readFile(path.join(__dirname, './email-templates/', `${templateName}.hbs`), 'utf8');
        const htmlTemplate = this.Handlebars.compile(Buffer.from(htmlTemplateSource).toString());
        const textTemplate = require(`./email-templates/${templateName}.txt.js`);

        const html = htmlTemplate(data);
        const text = textTemplate(data);

        return {html, text};
    }
}

module.exports = StaffServiceEmails;

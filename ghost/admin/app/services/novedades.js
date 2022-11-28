import Service, {inject as service} from '@ember/service';
import fetch from 'fetch';
import moment from 'moment-timezone';
import {action, computed} from '@ember/object';
import {isEmpty} from '@ember/utils';
import {task} from 'ember-concurrency';

export default Service.extend({
    session: service(),

    entries: null,
    changelogUrl: 'https://omniscientia.es/changelog/',
    isShowingModal: false,

    _user: null,

    init() {
        this._super(...arguments);
        this.entries = [];
    },

    novedadesSettings: computed('_user.accessibility', function () {
        let settingsJson = this.get('_user.accessibility') || '{}';
        let settings = JSON.parse(settingsJson);
        return settings.novedades;
    }),

    hasNew: computed('novedadesSettings.lastSeenDate', 'entries.[]', function () {
        if (isEmpty(this.entries)) {
            return false;
        }

        let [latestEntry] = this.entries;

        let lastSeenDate = this.get('novedadesSettings.lastSeenDate') || '2019-01-01 00:00:00';
        let lastSeenMoment = moment(lastSeenDate);
        let latestDate = latestEntry.published_at;
        let latestMoment = moment(latestDate || lastSeenDate);
        return latestMoment.isAfter(lastSeenMoment);
    }),

    showModal: action(function () {
        this.set('isShowingModal', true);
    }),

    closeModal: action(function () {
        this.set('isShowingModal', false);
        this.updateLastSeen.perform();
    }),

    fetchLatest: task(function* () {
        try {
            // we should already be logged in at this point so lets grab the user
            // record and store it locally so that we don't have to deal with
            // session.user being a promise and causing issues with CPs
            let user = yield this.session.user;
            this.set('_user', user);

            let result = {
                changelogUrl: 'http://localhost:2368/ghost/#/novedades',
                posts: [
                    {
                        title: 'Prueba de novedad',
                        feature_image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80',
                        custom_excerpt: null,
                        html: '<p>Este es un artículo de prueba para el apartado de novedades.</p><figure class="kg-card kg-image-card"><img src="https://ghost.org/changelog/content/images/2022/10/Email-Screenshot.png" class="kg-image" alt loading="lazy" width="1670" height="1566" srcset="https://ghost.org/changelog/content/images/size/w600/2022/10/Email-Screenshot.png 600w, https://ghost.org/changelog/content/images/size/w1000/2022/10/Email-Screenshot.png 1000w, https://ghost.org/changelog/content/images/size/w1600/2022/10/Email-Screenshot.png 1600w, https://ghost.org/changelog/content/images/2022/10/Email-Screenshot.png 1670w" sizes="(min-width: 720px) 720px"></figure><p>Lo de arriba es una foto y lo de abajo un vídeo.</p><figure class="kg-card kg-video-card"><div class="kg-video-container"><video src="https://ghost.org/changelog/content/media/2022/10/How-Audience-Feedback-Settings-Work.mp4" poster="https://img.spacergif.org/v1/2550x1820/0a/spacer.png" width="2550" height="1820" loop autoplay muted playsinline preload="metadata" style="background: transparent url(\'https://ghost.org/changelog/content/images/2022/10/Settings-Email-newsletter-Publisher-Weekly.png\') 50% 50% / cover no-repeat;" /></video><div class="kg-video-overlay"><button class="kg-video-large-play-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.14 10.608 2.253.164A1.559 1.559 0 0 0 0 1.557v20.887a1.558 1.558 0 0 0 2.253 1.392L23.14 13.393a1.557 1.557 0 0 0 0-2.785Z"/></svg></button></div><div class="kg-video-player-container kg-video-hide"><div class="kg-video-player"><button class="kg-video-play-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23.14 10.608 2.253.164A1.559 1.559 0 0 0 0 1.557v20.887a1.558 1.558 0 0 0 2.253 1.392L23.14 13.393a1.557 1.557 0 0 0 0-2.785Z"/></svg></button><button class="kg-video-pause-icon kg-video-hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="3" y="1" width="7" height="22" rx="1.5" ry="1.5"/><rect x="14" y="1" width="7" height="22" rx="1.5" ry="1.5"/></svg></button><span class="kg-video-current-time">0:00</span><div class="kg-video-time">/<span class="kg-video-duration"></span></div><input type="range" class="kg-video-seek-slider" max="100" value="0"><button class="kg-video-playback-rate">1\u0026#215;</button><button class="kg-video-unmute-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.189 2.021a9.728 9.728 0 0 0-7.924 4.85.249.249 0 0 1-.221.133H5.25a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1.794a.249.249 0 0 1 .221.133 9.73 9.73 0 0 0 7.924 4.85h.06a1 1 0 0 0 1-1V3.02a1 1 0 0 0-1.06-.998Z"/></svg></button><button class="kg-video-mute-icon kg-video-hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.177 4.3a.248.248 0 0 0 .073-.176v-1.1a1 1 0 0 0-1.061-1 9.728 9.728 0 0 0-7.924 4.85.249.249 0 0 1-.221.133H5.25a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h.114a.251.251 0 0 0 .177-.073ZM23.707 1.706A1 1 0 0 0 22.293.292l-22 22a1 1 0 0 0 0 1.414l.009.009a1 1 0 0 0 1.405-.009l6.63-6.631A.251.251 0 0 1 8.515 17a.245.245 0 0 1 .177.075 10.081 10.081 0 0 0 6.5 2.92 1 1 0 0 0 1.061-1V9.266a.247.247 0 0 1 .073-.176Z"/></svg></button><input type="range" class="kg-video-volume-slider" max="100" value="100"></div></div></div></figure><p>Fin de la prueba.</p><p></p>',
                        slug: 'test-novedad',
                        url: 'http://localhost:2368/ghost/#/novedades',
                        published_at: '2022-11-26T00:01:38.000+00:00'
                    }
                ]
            };
            this.set('entries', result.posts || []);
            this.set('changelogUrl', result.changelogUrl);
        } catch (e) {
            console.error(e); // eslint-disable-line
        }
    }),

    updateLastSeen: task(function* () {
        let settingsJson = this._user.accessibility || '{}';
        let settings = JSON.parse(settingsJson);
        let [latestEntry] = this.entries;

        if (!latestEntry) {
            return;
        }

        if (!settings.novedades) {
            settings.novedades = {};
        }

        settings.novedades.lastSeenDate = latestEntry.published_at;

        this._user.set('accessibility', JSON.stringify(settings));
        yield this._user.save();
    })
});

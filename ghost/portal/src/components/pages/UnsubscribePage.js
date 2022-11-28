import AppContext from '../../AppContext';
import ActionButton from '../common/ActionButton';
import {useContext, useEffect, useState} from 'react';
import {getSiteNewsletters} from '../../utils/helpers';
import setupGhostApi from '../../utils/api';
import NewsletterManagement from '../common/NewsletterManagement';
import CloseButton from '../common/CloseButton';
import {ReactComponent as WarningIcon} from '../../images/icons/warning-fill.svg';

const React = require('react');

function SiteLogo() {
    const {site} = useContext(AppContext);
    const siteLogo = site.icon;

    if (siteLogo) {
        return (
            <img className='gh-portal-unsubscribe-logo' src={siteLogo} alt={site.title} />
        );
    }
    return (null);
}

function AccountHeader() {
    const {site} = useContext(AppContext);
    const siteTitle = site.title || '';
    return (
        <header className='gh-portal-header'>
            <SiteLogo />
            <h2 className="gh-portal-publication-title">{siteTitle}</h2>
        </header>
    );
}

async function updateMemberNewsletters({api, memberUuid, newsletters, enableCommentNotifications}) {
    try {
        return await api.member.updateNewsletters({uuid: memberUuid, newsletters, enableCommentNotifications});
    } catch (e) {
        // ignore auto unsubscribe error
    }
}

export default function UnsubscribePage() {
    const {site, pageData, onAction} = useContext(AppContext);
    const api = setupGhostApi({siteUrl: site.url});
    const [member, setMember] = useState();
    const siteNewsletters = getSiteNewsletters({site});
    const defaultNewsletters = siteNewsletters.filter((d) => {
        return d.subscribe_on_signup;
    });
    const [hasInteracted, setHasInteracted] = useState(false);
    const [subscribedNewsletters, setSubscribedNewsletters] = useState(defaultNewsletters);
    const [showPrefs, setShowPrefs] = useState(false);
    const {comments_enabled: commentsEnabled} = site;
    const {enable_comment_notifications: enableCommentNotifications = false} = member || {};

    useEffect(() => {
        const ghostApi = setupGhostApi({siteUrl: site.url});
        (async () => {
            const memberData = await ghostApi.member.newsletters({uuid: pageData.uuid});

            setMember(memberData);
            const memberNewsletters = memberData?.newsletters || [];
            setSubscribedNewsletters(memberNewsletters);
            if (siteNewsletters?.length === 1 && !commentsEnabled) {
                // Unsubscribe from all the newsletters, because we only have one
                const updatedData = await updateMemberNewsletters({
                    api: ghostApi,
                    memberUuid: pageData.uuid,
                    newsletters: []
                });
                setSubscribedNewsletters(updatedData.newsletters);
            } else if (pageData.newsletterUuid) {
                // Unsubscribe link for a specific newsletter
                const updatedData = await updateMemberNewsletters({
                    api: ghostApi,
                    memberUuid: pageData.uuid,
                    newsletters: memberNewsletters?.filter((d) => {
                        return d.uuid !== pageData.newsletterUuid;
                    })
                });
                setSubscribedNewsletters(updatedData.newsletters);
            } else if (pageData.comments && commentsEnabled) {
                // Unsubscribe link for comments
                const updatedData = await updateMemberNewsletters({
                    api: ghostApi,
                    memberUuid: pageData.uuid,
                    enableCommentNotifications: false
                });

                setMember(updatedData);
            }
        })();
    }, [commentsEnabled, pageData.uuid, pageData.newsletterUuid, pageData.comments, site.url, siteNewsletters?.length]);

    // Case: Email not found
    if (member === null) {
        return (
            <div className='gh-portal-content gh-portal-feedback with-footer'>
                <CloseButton />
                <div class="gh-feedback-icon gh-feedback-icon-error">
                    <WarningIcon />
                </div>
                <h1 className="gh-portal-main-title">Algo no ha salido como estaba planeado</h1>
                <div>
                    <p className="gh-portal-text-center">No hemos podido darte de baja ya que no se encuentra registrada tu dirección de correo electrónico. Póngase en contacto con el equipo de soporte del sitio. </p>
                </div>
                <ActionButton
                    style={{width: '100%'}}
                    retry={false}
                    onClick = {() => onAction('closePopup')}
                    disabled={false}
                    brandColor='#000000'
                    label={'Close'}
                    isRunning={false}
                    tabindex='3'
                    classes={'sticky bottom'}
                />
            </div>
        );
    }

    // Case: Single active newsletter
    if (siteNewsletters?.length === 1 && !commentsEnabled && !showPrefs) {
        return (
            <div className='gh-portal-content gh-portal-unsubscribe with-footer'>
                <CloseButton />
                <AccountHeader />
                <h1 className="gh-portal-main-title">Baja realizada con éxito</h1>
                <div>
                    <p className='gh-portal-text-center'><strong>{member?.email}</strong> ya no recibirá este boletín.</p>
                    <p className='gh-portal-text-center'>¿No querías hacer eso? Cambia tus preferencias
                        <button
                            className="gh-portal-btn-link gh-portal-btn-branded gh-portal-btn-inline"
                            onClick={() => {
                                setShowPrefs(true);
                            }}
                        >
                        aquí
                        </button>.
                    </p>
                </div>
            </div>
        );
    }

    const HeaderNotification = () => {
        if (pageData.comments && commentsEnabled) {
            const hideClassName = hasInteracted ? 'gh-portal-hide' : '';
            return (
                <>
                    <p className={`gh-portal-text-center gh-portal-header-message ${hideClassName}`}><strong>{member?.email}</strong> ya no recibirá correos electrónicos cuando alguien responda a sus comentarios.</p>
                </>
            );
        }
        const unsubscribedNewsletter = siteNewsletters?.find((d) => {
            return d.uuid === pageData.newsletterUuid;
        });
        const hideClassName = hasInteracted ? 'gh-portal-hide' : '';
        return (
            <>
                <p className={`gh-portal-text-center gh-portal-header-message ${hideClassName}`}><strong>{member?.email}</strong> ya no recibirá el boletín: <strong>{unsubscribedNewsletter?.name}</strong>.</p>
            </>
        );
    };

    return (
        <NewsletterManagement
            notification={HeaderNotification}
            subscribedNewsletters={subscribedNewsletters}
            updateSubscribedNewsletters={async (newsletters) => {
                setSubscribedNewsletters(newsletters);
                setHasInteracted(true);
                await api.member.updateNewsletters({uuid: pageData.uuid, newsletters});
            }}
            updateCommentNotifications={async (enabled) => {
                const updatedMember = await api.member.updateNewsletters({uuid: pageData.uuid, enableCommentNotifications: enabled});
                setMember(updatedMember);
            }}
            unsubscribeAll={async () => {
                setHasInteracted(true);
                setSubscribedNewsletters([]);
                onAction('showPopupNotification', {
                    action: 'updated:success',
                    message: `Preferencia de email actualizada.`
                });
                const updatedMember = await api.member.updateNewsletters({uuid: pageData.uuid, newsletters: [], enableCommentNotifications: false});
                setMember(updatedMember);
            }}
            isPaidMember={member?.status !== 'free'}
            isCommentsEnabled={commentsEnabled !== 'off'}
            enableCommentNotifications={enableCommentNotifications}
        />
    );
}

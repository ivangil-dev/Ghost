import AppContext from 'AppContext';
import {useContext, useEffect} from 'react';
import {hasCommentsEnabled, hasMultipleNewsletters} from 'utils/helpers';
import CloseButton from 'components/common/CloseButton';
import BackButton from 'components/common/BackButton';
import ActionButton from 'components/common/ActionButton';
import {ReactComponent as EmailDeliveryFailedIcon} from 'images/icons/email-delivery-failed.svg';

export default function EmailSuppressedPage() {
    const {brandColor, lastPage, onAction, action, site} = useContext(AppContext);

    useEffect(() => {
        if (['removeEmailFromSuppressionList:success'].includes(action)) {
            onAction('refreshMemberData');
        }

        if (['removeEmailFromSuppressionList:failed', 'refreshMemberData:failed'].includes(action)) {
            onAction('back');
        }

        if (['refreshMemberData:success'].includes(action)) {
            const showEmailPreferences = hasMultipleNewsletters({site}) || hasCommentsEnabled({site});
            if (showEmailPreferences) {
                onAction('switchPage', {
                    page: 'accountEmail',
                    lastPage: 'accountHome'
                });
                onAction('showPopupNotification', {
                    message: 'Te has vuelto a inscribir con éxito'
                });
            } else {
                onAction('back');
            }
        }
    }, [action, onAction, site]);

    const isRunning = ['removeEmailFromSuppressionList:running', 'refreshMemberData:running'].includes(action);

    const handleSubmit = () => {
        onAction('removeEmailFromSuppressionList');
    };

    return (
        <div className="gh-email-suppressed-page">
            <header className='gh-portal-detail-header'>
                <BackButton brandColor={brandColor} hidden={!lastPage} onClick={() => {
                    onAction('back');
                }} />
                <CloseButton />
            </header>

            <EmailDeliveryFailedIcon className="gh-email-suppressed-page-icon" />

            <div className="gh-email-suppressed-page-text">
                <h3 className="gh-portal-main-title gh-email-suppressed-page-title">Correos electrónicos desactivados</h3>
                <p>
                    No estás recibiendo correos electrónicos porque has marcado un mensaje reciente como spam o porque los mensajes no se pueden entregar en tu dirección de correo electrónico proporcionada.
                </p>
            </div>

            <ActionButton
                dataTestId={'resubscribe-email'}
                classes="gh-portal-confirm-button"
                onClick={handleSubmit}
                disabled={isRunning}
                brandColor={brandColor}
                label="Re-activar emails"
                isRunning={isRunning}
            />
        </div>
    );
}

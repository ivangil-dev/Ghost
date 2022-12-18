import AppContext from 'AppContext';
import {useContext} from 'react';
import {isEmailSuppressed} from 'utils/helpers';
import {ReactComponent as EmailDeliveryFailedIcon} from 'images/icons/email-delivery-failed.svg';

function EmailPreferencesAction() {
    const {onAction, member} = useContext(AppContext);
    const emailSuppressed = isEmailSuppressed({member});
    const page = emailSuppressed ? 'emailSuppressed' : 'accountEmail';

    return (
        <section>
            <div className='gh-portal-list-detail'>
                <h3>Emails</h3>
                {
                    emailSuppressed
                        ? (
                            <p className="gh-portal-email-notice">
                                <EmailDeliveryFailedIcon className="gh-portal-email-notice-icon" />
                                <span>Tú <span className="gh-mobile-shortener">actualmente </span>no recibes emails</span>
                            </p>
                        )
                        : <p>Actualiza tus preferencias</p>
                }
            </div>
            <button className='gh-portal-btn gh-portal-btn-list' onClick={(e) => {
                onAction('switchPage', {
                    page,
                    lastPage: 'accountHome'
                });
            }} data-test-button='manage-newsletters'>
                Gestionar
            </button>
        </section>
    );
}

export default EmailPreferencesAction;

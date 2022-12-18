import AppContext from 'AppContext';
import {useContext} from 'react';
import BackButton from 'components/common/BackButton';
import CloseButton from 'components/common/CloseButton';
import {getDefaultNewsletterSender, getSupportAddress} from 'utils/helpers';

export default function EmailReceivingPage() {
    const {brandColor, onAction, site, lastPage, member} = useContext(AppContext);

    const supportAddressEmail = getSupportAddress({site});
    const supportAddress = `mailto:${supportAddressEmail}`;
    const defaultNewsletterSenderEmail = getDefaultNewsletterSender({site});
    return (
        <div className="gh-email-receiving-faq">
            <header className='gh-portal-detail-header'>
                <BackButton brandColor={brandColor} onClick={() => {
                    if (!lastPage) {
                        onAction('switchPage', {page: 'accountEmail', lastPage: 'accountHome'});
                    } else {
                        onAction('switchPage', {page: 'accountHome'});
                    }
                }} />
                <CloseButton />
            </header>

            <div class="gh-longform">
                <h3>¡Ayuda! No recibo correos electrónicos de mi suscripción</h3>

                <p>Si no estás recibiendo el boletín de correo electrónico al que te has suscrito, aquí hay algunas cosas para verificar.</p>

                <h4>Verifica que tu dirección de correo electrónico sea correcta</h4>

                <p>La dirección de correo electrónico que tenemos tuya es <strong>{member.email}</strong> &mdash; si eso no es correcto, puedes actualizarla en tu <button className="gh-portal-btn-text" onClick={() => onAction('switchPage', {lastPage: 'emailReceivingFAQ', page: 'accountProfile'})}>área de configuración de la cuenta</button>.</p>

                <h4>Comprueba las carpetas de spam y promociones</h4>

                <p>Asegúrate de que los correos electrónicos no terminen accidentalmente en las carpetas de spam o promociones de tu bandeja de entrada. Si eso pasa, haz clic en "Marcar como correo deseado"/"Este correo no es spam" y/o "mover a la bandeja de entrada".</p>

                <h4>Crea un nuevo contacto</h4>

                <p>En tu correo electrónico, agrega el cliente <strong>{defaultNewsletterSenderEmail}</strong> a tu lista de contactos. Esto indica a tu proveedor de correo que se debe confiar en los correos electrónicos enviados desde esta dirección.</p>

                <h4>Envía un correo electrónico y saluda!</h4>

                <p>Envia un correo electrónico a <strong>{defaultNewsletterSenderEmail}</strong> y saluda. Esto también puede ayudar a señalar a tu proveedor de correo que se debe confiar en los correos electrónicos de esta dirección.</p>

                <h4>Consulte con tu proveedor de correo</h4>

                <p>Si tienes una cuenta de correo electrónico corporativa o gubernamental, comunícate con el departamento de TI y pídeles que permitan recibir correos electrónicos de <strong>{defaultNewsletterSenderEmail}</strong></p>

                <h4>Ponte en contacto para obtener ayuda</h4>

                <p>Si has completado todos estos pasos y aún no recibes nuestros correos electrónicos, puedes comunicarse con el soporte contactando en <a href={supportAddress} onClick={() => {
                    supportAddress && window.open(supportAddress);
                }}>{supportAddressEmail}</a>.</p>
            </div>
        </div>
    );
}

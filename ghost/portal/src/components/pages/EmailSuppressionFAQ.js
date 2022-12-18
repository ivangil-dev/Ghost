import AppContext from 'AppContext';
import {useContext} from 'react';
import BackButton from 'components/common/BackButton';
import CloseButton from 'components/common/CloseButton';
import {getSupportAddress} from 'utils/helpers';

export default function EmailSuppressedPage() {
    const {brandColor, onAction, site} = useContext(AppContext);

    const supportAddress = `mailto:${getSupportAddress({site})}`;

    return (
        <div className="gh-email-suppression-faq">
            <header className='gh-portal-detail-header'>
                <BackButton brandColor={brandColor} onClick={() => {
                    onAction('switchPage', {page: 'emailSuppressed', lastPage: 'accountHome'});
                }} />
                <CloseButton />
            </header>

            <div class="gh-longform">
                <h3>¿Por qué mi correo electrónico ha sido desactivado?</h3>
                <p>Los boletines se pueden deshabilitar en tu cuenta por dos razones: un correo electrónico anterior se marcó como spam, o un intento de envío ha fallado  permanente (rebote).</p>
                <h4>Quejas de spam</h4>
                <p>Si un boletín es marcado como spam, los correos electrónicos se deshabilitan automáticamente para asegurarnos que esa dirección ya no reciba mensajes no deseados.</p>
                <p>Si nos marcaste como spam accidentalmente, o si deseas comenzar a recibir correos electrónicos de nuevo, puedes volver a suscribirte a los correos electrónicos haciendo clic en el botón de la pantalla anterior.</p>
                <p>Una vez que vuelvas a suscribirte, si aún no ves correos electrónicos en la bandeja de entrada, consulta la carpeta de spam. Algunos proveedores de bandejas de entrada mantienen un registro de quejas de spam anteriores y continuarán marcando nuestros correos electrónicos. Si esto sucede, marca el último boletín como 'no spam' para moverlo de vuelta a tu bandeja de entrada principal.</p>
                <h4>Fallo permanente (rebote)</h4>
                <p>Cuando una bandeja de entrada no acepta un correo electrónico, comúnmente se llama rebote. En muchos casos, esto puede ser temporal. Sin embargo, en algunos casos, un correo electrónico rebotado puede devolverse como un fallo permanente cuando una dirección de correo electrónico no es válida o es inexistente.</p>
                <p>En el caso de que recibamos un fallo permanente al intentar enviar un boletín, los correos electrónicos se deshabilitarán en esa cuenta.</p>
                <p>Si quieres comenzar a recibir correos electrónicos de nuevo, lo mejor es verificar tu dirección de correo electrónico en busca de cualquier problema y luego hacer clic en Verificar de la pantalla anterior.</p>
                <p><a className='gh-portal-btn gh-portal-btn-branded' href={supportAddress} onClick={() => {
                    supportAddress && window.open(supportAddress);
                }}>¿Necesitas más ayuda? Soporte técnico</a></p>
            </div>
        </div>
    );
}

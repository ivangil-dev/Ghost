import AuthenticatedRoute from 'ghost-admin/routes/authenticated';

export default class novedadesRoute extends AuthenticatedRoute {
    buildRouteInfoMetadata() {
        return {
            titleToken: `¿Que hay de nuevo?`
        };
    }
}

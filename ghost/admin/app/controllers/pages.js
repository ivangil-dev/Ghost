import PostsController from './posts';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';

const TYPES = [{
    name: 'Todas las páginas',
    value: null
}, {
    name: 'Borradores',
    value: 'draft'
}, {
    name: 'Publicadas',
    value: 'published'
}, {
    name: 'Programadas',
    value: 'scheduled'
}, {
    name: 'Destacadas',
    value: 'featured'
}];

const ORDERS = [{
    name: 'Nuevas primero',
    value: null
}, {
    name: 'Antiguas primero',
    value: 'published_at asc'
}, {
    name: 'Recientemente actualizadas',
    value: 'updated_at desc'
}];

export default class PagesController extends PostsController {
    @service router;

    availableTypes = TYPES;
    availableOrders = ORDERS;

    @action
    openEditor(page) {
        this.router.transitionTo('editor.edit', 'page', page.get('id'));
    }
}

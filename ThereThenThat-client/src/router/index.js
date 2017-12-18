import Vue from 'vue';
import Router from 'vue-router';
import TTTHeader from '@/components/TTTHeader';
import AllCollections from '@/components/AllCollections';
import CurrentCollection from '@/components/CurrentCollection';
import TagView from '@/components/TagView';
import TestCollection from '@/components/TestCollection';
import About from '@/components/About';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
  {
    path: '/',
    component: AllCollections,
    name: 'AllCollections'
  },

  {
    path: '/api/gettags/:tags',
    name: 'TagView',
    component: TagView,
    props: (route) => ({ mode: 'byTags' })    
  },

  // handle TTT Addresses
  {
    path: '/:location/:time/:tags/:people/:options',
    name: 'SingleLTTPO',
    component: CurrentCollection,
    props: (route) => ({ mode: 'byCollection' })
  },
  {
    path: '/:location/:time/:tags/:people',
    name: 'SingleLTTP',
    component: CurrentCollection,
    props: (route) => ({ mode: 'byCollection' })
  },
  {
    path: '/:location/:time/:tags',
    name: 'SingleLTT',
    component: CurrentCollection,
    props: (route) => ({ mode: 'byCollection' })
  },
  {
    path: '/:location/:time',
    name: 'SingleLT',
    component: CurrentCollection,
    props: (route) => ({ mode: 'byCollection' })
  },
  {
    path: '/:location',
    name: 'SingleL',
    component: CurrentCollection,
    props: (route) => ({ mode: 'byCollection' })
  }
  ],
});

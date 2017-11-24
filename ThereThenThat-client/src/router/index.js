import Vue from 'vue';
import Router from 'vue-router';
import TTTHeader from '@/components/TTTHeader';
import AllCollections from '@/components/AllCollections';
import CurrentCollection from '@/components/CurrentCollection';
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
    path: '/about',
    name: 'About',
    component: About
  },

  // handle TTT Addresses
  {
    path: '/tt',
    name: 'Single',
    component: CurrentCollection
  },
  {
    path: '/:location/:time/:tags/:people/:options',
    name: 'SingleLTTPO',
    component: CurrentCollection
  },
  {
    path: '/:location/:time/:tags/:people',
    name: 'SingleLTTP',
    component: CurrentCollection
  },
  {
    path: '/:location/:time/:tags',
    name: 'SingleLTT',
    component: CurrentCollection
  },
  {
    path: '/:location/:time',
    name: 'SingleLT',
    component: CurrentCollection
  },
  {
    path: '/:location',
    name: 'SingleL',
    component: TestCollection
  }
  ],
});

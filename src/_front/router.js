import { createRouter, createWebHistory } from 'vue-router';

import wwPage from './views/wwPage.vue';

import { initializeData, initializePlugins, onPageUnload } from '@/_common/helpers/data';

let router;
const routes = [];

function scrollBehavior(to) {
    if (to.hash) {
        return {
            el: to.hash,
            behavior: 'smooth',
        };
    } else {
        return { top: 0 };
    }
}

 
/* wwFront:start */
import pluginsSettings from '../../plugins-settings.json';

// eslint-disable-next-line no-undef
window.wwg_designInfo = {"id":"0931a0db-844a-407a-8b66-327c06d52582","homePageId":"2b3bf681-e5ee-438e-bd05-8b274f169184","authPluginId":"1fa0dd68-5069-436c-9a7d-3b54c340f1fa","baseTag":null,"defaultTheme":"light","langs":[{"lang":"en","default":true}],"background":{},"workflows":[],"pages":[{"id":"64ca98f1-c800-451d-85a7-348b20c2ab17","linkId":"64ca98f1-c800-451d-85a7-348b20c2ab17","name":"Home","folder":null,"paths":{"en":"home","default":"home"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"ad7a54bd-867a-425b-a588-97911758e04b","sectionTitle":"Header Section","linkId":"b9f0f0ef-dd32-417b-b8cc-9c7e4db0917f"},{"uid":"5fc92ae8-c088-4bc4-b0d3-dbd281b9e540","sectionTitle":"Mobile Navigation Overlay","linkId":"b171bdbd-79e9-4614-b3aa-ce026eac6372"},{"uid":"aa3e4639-9a82-441c-a5b7-7cb883c629d9","sectionTitle":"Main Content Section","linkId":"cd709c3a-ab8b-42e4-aa00-1d550eb57e2a"},{"uid":"55f0145b-d546-46a7-a7be-16ec69b7f91f","sectionTitle":"Profile Sidebar Overlay","linkId":"c43d8a3e-5160-48b9-b9c0-0b8703128dd7"}],"pageUserGroups":[{}],"title":{"en":"","fr":"Vide | Commencer à partir de zéro"},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":""},{"id":"6487951c-6269-45cd-a412-0d2f19c261d1","linkId":"6487951c-6269-45cd-a412-0d2f19c261d1","name":"Internal Home","folder":"","paths":{"en":"admin-home","default":"admin-home"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"5449d6da-83bf-4641-83e7-2d7ad559554c","sectionTitle":"Header Section","linkId":"7daab918-3a92-4e3c-a3e7-cde5d7deb4ff"},{"uid":"1733b736-71d9-4c38-aacb-d452e21f4101","sectionTitle":"Main Section","linkId":"b8d4bfc4-0b98-4840-bbbe-b99aaaa0dddd"}],"pageUserGroups":[{},{"userGroup":{"id":"0cccc597-21bc-47f3-902c-3db9f45129e7","roles":[{"value":2},{"value":3},{"value":4},{"value":5}]}}],"title":{"en":"Admin Home"},"meta":{"desc":{"en":"Admin home page for employees to manage the system."},"keywords":{"en":"admin, dashboard, employees"},"socialDesc":{"en":"Admin home page for employees to manage the system."},"socialTitle":{"en":"Admin Home"}},"metaImage":""},{"id":"71d3db28-68ef-4805-a157-17d686c40699","linkId":"71d3db28-68ef-4805-a157-17d686c40699","name":"Internal Project Details","folder":"","paths":{"en":"admin-project-edit/{{projectId|4}}","default":"admin-project-edit/{{projectId|4}}"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"d7b9576d-ff15-4f44-a47d-6b8c5a446bf6","sectionTitle":"Header Section","linkId":"24a81119-2798-4f9e-a7bc-47320001b9c4"},{"uid":"5f42ad60-4828-40b9-8bd7-85f06c5758fc","sectionTitle":"Main Content Section","linkId":"89bec708-0279-447a-b670-5f06e900d76b"},{"uid":"a2803c40-d5d0-4398-890c-f42e4fa794f9","sectionTitle":"Loading Overlay","linkId":"b43b3822-248a-43b1-b86d-237c56796a2b"}],"pageUserGroups":[{},{"userGroup":{"id":"0cccc597-21bc-47f3-902c-3db9f45129e7","roles":[{"value":2},{"value":3},{"value":4},{"value":5}]}}],"title":{"en":"Edit Project"},"meta":{"desc":{"en":"Admin page to drill down and edit project information, stages, and updates."},"keywords":{"en":"admin, project, edit, stages, updates"},"socialDesc":{"en":"Admin page to drill down and edit project information, stages, and updates."},"socialTitle":{"en":"Edit Project"}},"metaImage":""},{"id":"66f29f1a-1542-4d05-b2c0-42488bd3d15a","linkId":"66f29f1a-1542-4d05-b2c0-42488bd3d15a","name":"Onboarding","folder":null,"paths":{"en":"customer-onboarding","default":"customer-onboarding"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"ca2fda2a-0811-475c-9f48-ee0cea1dd1fd","sectionTitle":"Onboarding Container","linkId":"3a136de8-94d6-4980-b112-9d141e5cdbc8"}],"pageUserGroups":[{}],"title":{},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":""},{"id":"f0ed106a-d5bc-4bd0-b71c-4eb4d0e5efd9","linkId":"f0ed106a-d5bc-4bd0-b71c-4eb4d0e5efd9","name":"Inspiration","folder":"","paths":{"en":"inspiration","default":"inspiration"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"2fc305f9-8e84-4482-9650-198827368564","sectionTitle":"Header Section","linkId":"bd254c86-f727-43d9-a678-5449d52264fd"},{"uid":"62cc08cd-4c34-4501-892f-6beddf61586c","sectionTitle":"Mobile Navigation Overlay","linkId":"94f439c8-b08c-4dfa-bcc1-05cd2ef0b39a"},{"uid":"36bb50bd-0a4a-4ce9-8565-cd2693bf779a","sectionTitle":"Main Content","linkId":"de1d4bb4-cf07-454f-a28e-7adf026f34a8"},{"uid":"82be499c-3174-40d3-a1a5-8bb379719a50","sectionTitle":"Profile Sidebar Overlay","linkId":"217ce095-27e2-45fa-8d83-0f2e89b7d04f"}],"pageUserGroups":[{}],"title":{"en":"Inspiration Gallery"},"meta":{"desc":{"en":"Browse and filter cabinet inspiration images by type and view your own uploads."},"keywords":{"en":"inspiration, cabinets, kitchen, bathroom, filter, gallery"},"socialDesc":{"en":"Explore a collection of cabinet inspiration images and manage your own uploads."},"socialTitle":{"en":"Inspiration Gallery"}},"metaImage":""},{"id":"2b3bf681-e5ee-438e-bd05-8b274f169184","linkId":"2b3bf681-e5ee-438e-bd05-8b274f169184","name":"Sign Up","folder":null,"paths":{"en":"sign-up","default":"sign-up"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"62c39be7-6466-4125-833d-b5dcea3c3353","sectionTitle":"Login","linkId":"f71e3ff0-4654-471b-a773-c370cb3f934a"}],"pageUserGroups":[],"title":{},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":""},{"id":"661d8eda-f8e1-4975-9f04-e7be5e0d2454","linkId":"661d8eda-f8e1-4975-9f04-e7be5e0d2454","name":"Project Details","folder":null,"paths":{"en":"project-details/{{projectId|}}","default":"project-details/{{projectId|}}"},"langs":["en"],"cmsDataSetPath":null,"sections":[{"uid":"fc2b3515-0566-4ed5-8a65-787aea7a28f0","sectionTitle":"Main Content Section","linkId":"3c90ccd5-77a5-4551-8605-3490fdbe8279"}],"pageUserGroups":[{}],"title":{},"meta":{"desc":{},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":""}],"plugins":[{"id":"f9ef41c3-1c53-4857-855b-f2f6a40b7186","name":"Supabase","namespace":"supabase"},{"id":"1fa0dd68-5069-436c-9a7d-3b54c340f1fa","name":"Supabase Auth","namespace":"supabaseAuth"},{"id":"2bd1c688-31c5-443e-ae25-59aa5b6431fb","name":"REST API","namespace":"restApi"}]};
// eslint-disable-next-line no-undef
window.wwg_cacheVersion = 8;
// eslint-disable-next-line no-undef
window.wwg_pluginsSettings = pluginsSettings;
// eslint-disable-next-line no-undef
window.wwg_disableManifest = false;

const defaultLang = window.wwg_designInfo.langs.find(({ default: isDefault }) => isDefault) || {};

const registerRoute = (page, lang, forcedPath) => {
    const langSlug = !lang.default || lang.isDefaultPath ? `/${lang.lang}` : '';
    let path =
        forcedPath ||
        (page.id === window.wwg_designInfo.homePageId ? '/' : `/${page.paths[lang.lang] || page.paths.default}`);

    //Replace params
    path = path.replace(/{{([\w]+)\|([^/]+)?}}/g, ':$1');

    routes.push({
        path: langSlug + path,
        component: wwPage,
        name: `page-${page.id}-${lang.lang}`,
        meta: {
            pageId: page.id,
            lang,
            isPrivate: !!page.pageUserGroups?.length,
        },
        async beforeEnter(to, from) {
            if (to.name === from.name) return;
            //Set page lang
            wwLib.wwLang.defaultLang = defaultLang.lang;
            wwLib.$store.dispatch('front/setLang', lang.lang);

            //Init plugins
            await initializePlugins();

            //Check if private page
            if (page.pageUserGroups?.length) {
                // cancel navigation if no plugin
                if (!wwLib.wwAuth.plugin) {
                    return false;
                }

                await wwLib.wwAuth.init();

                // Redirect to not sign in page if not logged
                if (!wwLib.wwAuth.getIsAuthenticated()) {
                    window.location.href = `${wwLib.wwPageHelper.getPagePath(
                        wwLib.wwAuth.getUnauthenticatedPageId()
                    )}?_source=${to.path}`;

                    return null;
                }

                //Check roles are required
                if (
                    page.pageUserGroups.length > 1 &&
                    !wwLib.wwAuth.matchUserGroups(page.pageUserGroups.map(({ userGroup }) => userGroup))
                ) {
                    window.location.href = `${wwLib.wwPageHelper.getPagePath(
                        wwLib.wwAuth.getUnauthorizedPageId()
                    )}?_source=${to.path}`;

                    return null;
                }
            }

            try {
                await import(`@/pages/${page.id.split('_')[0]}.js`);
                await wwLib.wwWebsiteData.fetchPage(page.id);

                //Scroll to section or on top after page change
                if (to.hash) {
                    const targetElement = document.getElementById(to.hash.replace('#', ''));
                    if (targetElement) targetElement.scrollIntoView();
                } else {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }

                return;
            } catch (err) {
                wwLib.$store.dispatch('front/showPageLoadProgress', false);

                if (err.redirectUrl) {
                    return { path: err.redirectUrl || '404' };
                } else {
                    //Any other error: go to target page using window.location
                    window.location = to.fullPath;
                }
            }
        },
    });
};

for (const page of window.wwg_designInfo.pages) {
    for (const lang of window.wwg_designInfo.langs) {
        if (!page.langs.includes(lang.lang)) continue;
        registerRoute(page, lang);
    }
}

const page404 = window.wwg_designInfo.pages.find(page => page.paths.default === '404');
if (page404) {
    for (const lang of window.wwg_designInfo.langs) {
        // Create routes /:lang/:pathMatch(.*)* etc for all langs of the 404 page
        if (!page404.langs.includes(lang.lang)) continue;
        registerRoute(
            page404,
            {
                default: false,
                lang: lang.lang,
            },
            '/:pathMatch(.*)*'
        );
    }
    // Create route /:pathMatch(.*)* using default project lang
    registerRoute(page404, { default: true, isDefaultPath: false, lang: defaultLang.lang }, '/:pathMatch(.*)*');
} else {
    routes.push({
        path: '/:pathMatch(.*)*',
        async beforeEnter() {
            window.location.href = '/404';
        },
    });
}

let routerOptions = {};

const isProd =
    !window.location.host.includes(
        // TODO: add staging2 ?
        '-staging.' + (process.env.WW_ENV === 'staging' ? import.meta.env.VITE_APP_PREVIEW_URL : '')
    ) && !window.location.host.includes(import.meta.env.VITE_APP_PREVIEW_URL);

if (isProd && window.wwg_designInfo.baseTag?.href) {
    let baseTag = window.wwg_designInfo.baseTag.href;
    if (!baseTag.startsWith('/')) {
        baseTag = '/' + baseTag;
    }
    if (!baseTag.endsWith('/')) {
        baseTag += '/';
    }

    routerOptions = {
        base: baseTag,
        history: createWebHistory(baseTag),
        routes,
    };
} else {
    routerOptions = {
        history: createWebHistory(),
        routes,
    };
}

router = createRouter({
    ...routerOptions,
    scrollBehavior,
});

//Trigger on page unload
let isFirstNavigation = true;
router.beforeEach(async (to, from) => {
    if (to.name === from.name) return;
    if (!isFirstNavigation) await onPageUnload();
    isFirstNavigation = false;
    wwLib.globalVariables._navigationId++;
    return;
});

//Init page
router.afterEach((to, from, failure) => {
    wwLib.$store.dispatch('front/showPageLoadProgress', false);
    let fromPath = from.path;
    let toPath = to.path;
    if (!fromPath.endsWith('/')) fromPath = fromPath + '/';
    if (!toPath.endsWith('/')) toPath = toPath + '/';
    if (failure || (from.name && toPath === fromPath)) return;
    initializeData(to);
});
/* wwFront:end */

export default router;

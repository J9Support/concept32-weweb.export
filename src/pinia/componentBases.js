import { defineStore } from 'pinia';
import { getInheritedConfiguration } from '@/_common/helpers/configuration/configuration';
 
/* wwFront:start */
import plugin1fa0dd685069436c9a7d3b54c340f1fa from '@/components/plugins/plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa/ww-config.js';
import pluginf9ef41c31c534857855bf2f6a40b7186 from '@/components/plugins/plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186/ww-config.js';
import plugin2bd1c68831c5443eae2559aa5b6431fb from '@/components/plugins/plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb/ww-config.js';
import section99586bd32b154d6ba0256a50d07ca845 from '@/components/sections/section-99586bd3-2b15-4d6b-a025-6a50d07ca845/ww-config.js';
import wwobjectaeb78b9a6fb64c49931dfaedcfad67ba from '@/components/elements/element-aeb78b9a-6fb6-4c49-931d-faedcfad67ba/ww-config.js';
import wwobjectfd8c482f532c4aeba7ae6904a6b62a1b from '@/components/elements/element-fd8c482f-532c-4aeb-a7ae-6904a6b62a1b/ww-config.js';
import wwobject99ea5bf7b91e43ea8ec3dbaf2b171e34 from '@/components/elements/element-99ea5bf7-b91e-43ea-8ec3-dbaf2b171e34/ww-config.js';
import wwobject0d3e75d19e7744cba2728b0825fbc5da from '@/components/elements/element-0d3e75d1-9e77-44cb-a272-8b0825fbc5da/ww-config.js';
import wwobject69d0b3efb265494c8cd1874da4aa1834 from '@/components/elements/element-69d0b3ef-b265-494c-8cd1-874da4aa1834/ww-config.js';
import wwobject83d890fb84f94386b459fb4be89a8e15 from '@/components/elements/element-83d890fb-84f9-4386-b459-fb4be89a8e15/ww-config.js';
import wwobject6f8796b18273498d95fc7013b7c63214 from '@/components/elements/element-6f8796b1-8273-498d-95fc-7013b7c63214/ww-config.js';
import wwobjectd7904e9dfc9a4d809e32728e097879ad from '@/components/elements/element-d7904e9d-fc9a-4d80-9e32-728e097879ad/ww-config.js';
import wwobject7179ba70c5d749a59828f85704fd1efc from '@/components/elements/element-7179ba70-c5d7-49a5-9828-f85704fd1efc/ww-config.js';
import wwobjectaa27b26f06864c2998c58217044045b7 from '@/components/elements/element-aa27b26f-0686-4c29-98c5-8217044045b7/ww-config.js';
import wwobject3a7d637912d3438798ffb332bb492a63 from '@/components/elements/element-3a7d6379-12d3-4387-98ff-b332bb492a63/ww-config.js';
import wwobjectb783dc65d5284f748c14e27c934c39b1 from '@/components/elements/element-b783dc65-d528-4f74-8c14-e27c934c39b1/ww-config.js';
import wwobject53401515b6944c79a88dabeecb1de562 from '@/components/elements/element-53401515-b694-4c79-a88d-abeecb1de562/ww-config.js';
import wwobject1b1e21739b7842cca8eea6167caea340 from '@/components/elements/element-1b1e2173-9b78-42cc-a8ee-a6167caea340/ww-config.js';
import wwobject59dca300db7842e4a7a60cbf22d3cc82 from '@/components/elements/element-59dca300-db78-42e4-a7a6-0cbf22d3cc82/ww-config.js';
import wwobjecta6cb6a4d6af74cd6b530a15d9ec64488 from '@/components/elements/element-a6cb6a4d-6af7-4cd6-b530-a15d9ec64488/ww-config.js';
import wwobject9ccf84b0e5424423869fb4828301ec49 from '@/components/elements/element-9ccf84b0-e542-4423-869f-b4828301ec49/ww-config.js';
import wwobjectdeb10a015eef4aa190171b51c2ad6fd0 from '@/components/elements/element-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0/ww-config.js';
import wwobject9ae1fce82e314bfda4d20450235bdfd5 from '@/components/elements/element-9ae1fce8-2e31-4bfd-a4d2-0450235bdfd5/ww-config.js';
import wwobjectc6c0c00e49fd4cb9bd785bc09945721e from '@/components/elements/element-c6c0c00e-49fd-4cb9-bd78-5bc09945721e/ww-config.js';
import wwobject9896d6950c964a0fb587c25e879ece77 from '@/components/elements/element-9896d695-0c96-4a0f-b587-c25e879ece77/ww-config.js';
import wwobjecta823467cbdc74ceca38c71875c4c214a from '@/components/elements/element-a823467c-bdc7-4cec-a38c-71875c4c214a/ww-config.js';
import wwobject2c8e3e543ea348eab8c8e7580e3362a2 from '@/components/elements/element-2c8e3e54-3ea3-48ea-b8c8-e7580e3362a2/ww-config.js';
import wwobject985570fcb3c04566800482ab3b30a11d from '@/components/elements/element-985570fc-b3c0-4566-8004-82ab3b30a11d/ww-config.js';
import wwobject6145eb600af84e52bcc6dc0f6743654e from '@/components/elements/element-6145eb60-0af8-4e52-bcc6-dc0f6743654e/ww-config.js';
import wwobjectd2eeb897ad9549e48394fe3f5c9a81fb from '@/components/elements/element-d2eeb897-ad95-49e4-8394-fe3f5c9a81fb/ww-config.js';
import wwobject9ecb2cfccef74be8b7363e17a3b7e9ff from '@/components/elements/element-9ecb2cfc-cef7-4be8-b736-3e17a3b7e9ff/ww-config.js';
import wwobject14723a2101784d92a7e9d1dfeaec29a7 from '@/components/elements/element-14723a21-0178-4d92-a7e9-d1dfeaec29a7/ww-config.js';
/* wwFront:end */

export const useComponentBasesStore = defineStore('componentBases', () => {
    let configurations;
    /* wwFront:start */
    // eslint-disable-next-line no-undef
    configurations = {'plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa': getInheritedConfiguration({ ...plugin1fa0dd685069436c9a7d3b54c340f1fa, name: 'plugin-1fa0dd68-5069-436c-9a7d-3b54c340f1fa' }),
'plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186': getInheritedConfiguration({ ...pluginf9ef41c31c534857855bf2f6a40b7186, name: 'plugin-f9ef41c3-1c53-4857-855b-f2f6a40b7186' }),
'plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb': getInheritedConfiguration({ ...plugin2bd1c68831c5443eae2559aa5b6431fb, name: 'plugin-2bd1c688-31c5-443e-ae25-59aa5b6431fb' }),
'section-99586bd3-2b15-4d6b-a025-6a50d07ca845': getInheritedConfiguration({ ...section99586bd32b154d6ba0256a50d07ca845, name: 'section-99586bd3-2b15-4d6b-a025-6a50d07ca845' }),
'wwobject-aeb78b9a-6fb6-4c49-931d-faedcfad67ba': getInheritedConfiguration({ ...wwobjectaeb78b9a6fb64c49931dfaedcfad67ba, name: 'wwobject-aeb78b9a-6fb6-4c49-931d-faedcfad67ba' }),
'wwobject-fd8c482f-532c-4aeb-a7ae-6904a6b62a1b': getInheritedConfiguration({ ...wwobjectfd8c482f532c4aeba7ae6904a6b62a1b, name: 'wwobject-fd8c482f-532c-4aeb-a7ae-6904a6b62a1b' }),
'wwobject-99ea5bf7-b91e-43ea-8ec3-dbaf2b171e34': getInheritedConfiguration({ ...wwobject99ea5bf7b91e43ea8ec3dbaf2b171e34, name: 'wwobject-99ea5bf7-b91e-43ea-8ec3-dbaf2b171e34' }),
'wwobject-0d3e75d1-9e77-44cb-a272-8b0825fbc5da': getInheritedConfiguration({ ...wwobject0d3e75d19e7744cba2728b0825fbc5da, name: 'wwobject-0d3e75d1-9e77-44cb-a272-8b0825fbc5da' }),
'wwobject-69d0b3ef-b265-494c-8cd1-874da4aa1834': getInheritedConfiguration({ ...wwobject69d0b3efb265494c8cd1874da4aa1834, name: 'wwobject-69d0b3ef-b265-494c-8cd1-874da4aa1834' }),
'wwobject-83d890fb-84f9-4386-b459-fb4be89a8e15': getInheritedConfiguration({ ...wwobject83d890fb84f94386b459fb4be89a8e15, name: 'wwobject-83d890fb-84f9-4386-b459-fb4be89a8e15' }),
'wwobject-6f8796b1-8273-498d-95fc-7013b7c63214': getInheritedConfiguration({ ...wwobject6f8796b18273498d95fc7013b7c63214, name: 'wwobject-6f8796b1-8273-498d-95fc-7013b7c63214' }),
'wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad': getInheritedConfiguration({ ...wwobjectd7904e9dfc9a4d809e32728e097879ad, name: 'wwobject-d7904e9d-fc9a-4d80-9e32-728e097879ad' }),
'wwobject-7179ba70-c5d7-49a5-9828-f85704fd1efc': getInheritedConfiguration({ ...wwobject7179ba70c5d749a59828f85704fd1efc, name: 'wwobject-7179ba70-c5d7-49a5-9828-f85704fd1efc' }),
'wwobject-aa27b26f-0686-4c29-98c5-8217044045b7': getInheritedConfiguration({ ...wwobjectaa27b26f06864c2998c58217044045b7, name: 'wwobject-aa27b26f-0686-4c29-98c5-8217044045b7' }),
'wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63': getInheritedConfiguration({ ...wwobject3a7d637912d3438798ffb332bb492a63, name: 'wwobject-3a7d6379-12d3-4387-98ff-b332bb492a63' }),
'wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1': getInheritedConfiguration({ ...wwobjectb783dc65d5284f748c14e27c934c39b1, name: 'wwobject-b783dc65-d528-4f74-8c14-e27c934c39b1' }),
'wwobject-53401515-b694-4c79-a88d-abeecb1de562': getInheritedConfiguration({ ...wwobject53401515b6944c79a88dabeecb1de562, name: 'wwobject-53401515-b694-4c79-a88d-abeecb1de562' }),
'wwobject-1b1e2173-9b78-42cc-a8ee-a6167caea340': getInheritedConfiguration({ ...wwobject1b1e21739b7842cca8eea6167caea340, name: 'wwobject-1b1e2173-9b78-42cc-a8ee-a6167caea340' }),
'wwobject-59dca300-db78-42e4-a7a6-0cbf22d3cc82': getInheritedConfiguration({ ...wwobject59dca300db7842e4a7a60cbf22d3cc82, name: 'wwobject-59dca300-db78-42e4-a7a6-0cbf22d3cc82' }),
'wwobject-a6cb6a4d-6af7-4cd6-b530-a15d9ec64488': getInheritedConfiguration({ ...wwobjecta6cb6a4d6af74cd6b530a15d9ec64488, name: 'wwobject-a6cb6a4d-6af7-4cd6-b530-a15d9ec64488' }),
'wwobject-9ccf84b0-e542-4423-869f-b4828301ec49': getInheritedConfiguration({ ...wwobject9ccf84b0e5424423869fb4828301ec49, name: 'wwobject-9ccf84b0-e542-4423-869f-b4828301ec49' }),
'wwobject-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0': getInheritedConfiguration({ ...wwobjectdeb10a015eef4aa190171b51c2ad6fd0, name: 'wwobject-deb10a01-5eef-4aa1-9017-1b51c2ad6fd0' }),
'wwobject-9ae1fce8-2e31-4bfd-a4d2-0450235bdfd5': getInheritedConfiguration({ ...wwobject9ae1fce82e314bfda4d20450235bdfd5, name: 'wwobject-9ae1fce8-2e31-4bfd-a4d2-0450235bdfd5' }),
'wwobject-c6c0c00e-49fd-4cb9-bd78-5bc09945721e': getInheritedConfiguration({ ...wwobjectc6c0c00e49fd4cb9bd785bc09945721e, name: 'wwobject-c6c0c00e-49fd-4cb9-bd78-5bc09945721e' }),
'wwobject-9896d695-0c96-4a0f-b587-c25e879ece77': getInheritedConfiguration({ ...wwobject9896d6950c964a0fb587c25e879ece77, name: 'wwobject-9896d695-0c96-4a0f-b587-c25e879ece77' }),
'wwobject-a823467c-bdc7-4cec-a38c-71875c4c214a': getInheritedConfiguration({ ...wwobjecta823467cbdc74ceca38c71875c4c214a, name: 'wwobject-a823467c-bdc7-4cec-a38c-71875c4c214a' }),
'wwobject-2c8e3e54-3ea3-48ea-b8c8-e7580e3362a2': getInheritedConfiguration({ ...wwobject2c8e3e543ea348eab8c8e7580e3362a2, name: 'wwobject-2c8e3e54-3ea3-48ea-b8c8-e7580e3362a2' }),
'wwobject-985570fc-b3c0-4566-8004-82ab3b30a11d': getInheritedConfiguration({ ...wwobject985570fcb3c04566800482ab3b30a11d, name: 'wwobject-985570fc-b3c0-4566-8004-82ab3b30a11d' }),
'wwobject-6145eb60-0af8-4e52-bcc6-dc0f6743654e': getInheritedConfiguration({ ...wwobject6145eb600af84e52bcc6dc0f6743654e, name: 'wwobject-6145eb60-0af8-4e52-bcc6-dc0f6743654e' }),
'wwobject-d2eeb897-ad95-49e4-8394-fe3f5c9a81fb': getInheritedConfiguration({ ...wwobjectd2eeb897ad9549e48394fe3f5c9a81fb, name: 'wwobject-d2eeb897-ad95-49e4-8394-fe3f5c9a81fb' }),
'wwobject-9ecb2cfc-cef7-4be8-b736-3e17a3b7e9ff': getInheritedConfiguration({ ...wwobject9ecb2cfccef74be8b7363e17a3b7e9ff, name: 'wwobject-9ecb2cfc-cef7-4be8-b736-3e17a3b7e9ff' }),
'wwobject-14723a21-0178-4d92-a7e9-d1dfeaec29a7': getInheritedConfiguration({ ...wwobject14723a2101784d92a7e9d1dfeaec29a7, name: 'wwobject-14723a21-0178-4d92-a7e9-d1dfeaec29a7' })};
    /* wwFront:end */
 
    return {
        configurations,
     };
});

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const pages = {"home":{"outputDir":"./home","lang":"en","cacheVersion":8,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/home/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/home/"}]},"admin-home":{"outputDir":"./admin-home","lang":"en","title":"Admin Home","cacheVersion":8,"meta":[{"name":"title","content":"Admin Home"},{"name":"description","content":"Admin home page for employees to manage the system."},{"name":"keywords","content":"admin, dashboard, employees"},{"itemprop":"name","content":"Admin Home"},{"itemprop":"description","content":"Admin home page for employees to manage the system."},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Admin Home"},{"name":"twitter:description","content":"Admin home page for employees to manage the system."},{"property":"og:title","content":"Admin Home"},{"property":"og:description","content":"Admin home page for employees to manage the system."},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/admin-home/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/admin-home/"}]},"admin-project-edit/:param":{"outputDir":"./admin-project-edit/:param","lang":"en","title":"Edit Project","cacheVersion":8,"meta":[{"name":"title","content":"Edit Project"},{"name":"description","content":"Admin page to drill down and edit project information, stages, and updates."},{"name":"keywords","content":"admin, project, edit, stages, updates"},{"itemprop":"name","content":"Edit Project"},{"itemprop":"description","content":"Admin page to drill down and edit project information, stages, and updates."},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Edit Project"},{"name":"twitter:description","content":"Admin page to drill down and edit project information, stages, and updates."},{"property":"og:title","content":"Edit Project"},{"property":"og:description","content":"Admin page to drill down and edit project information, stages, and updates."},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/admin-project-edit/:param/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/admin-project-edit/:param/"}]},"customer-onboarding":{"outputDir":"./customer-onboarding","lang":"en","cacheVersion":8,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/customer-onboarding/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/customer-onboarding/"}]},"inspiration":{"outputDir":"./inspiration","lang":"en","title":"Inspiration Gallery","cacheVersion":8,"meta":[{"name":"title","content":"Inspiration Gallery"},{"name":"description","content":"Browse and filter cabinet inspiration images by type and view your own uploads."},{"name":"keywords","content":"inspiration, cabinets, kitchen, bathroom, filter, gallery"},{"itemprop":"name","content":"Inspiration Gallery"},{"itemprop":"description","content":"Browse and filter cabinet inspiration images by type and view your own uploads."},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Inspiration Gallery"},{"name":"twitter:description","content":"Explore a collection of cabinet inspiration images and manage your own uploads."},{"property":"og:title","content":"Inspiration Gallery"},{"property":"og:description","content":"Explore a collection of cabinet inspiration images and manage your own uploads."},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/inspiration/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/inspiration/"}]},"index":{"outputDir":"./","lang":"en","cacheVersion":8,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/"}]},"project-details/:param":{"outputDir":"./project-details/:param","lang":"en","cacheVersion":8,"meta":[{"name":"twitter:card","content":"summary"},{"property":"og:type","content":"website"},{"name":"robots","content":"noindex, nofollow"}],"scripts":{"head":"\n","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/project-details/:param/"},{"rel":"alternate","hreflang":"en","href":"https://0931a0db-844a-407a-8b66-327c06d52582.weweb-preview.io/project-details/:param/"}]}};

// Read the main HTML template
const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
const compiledTemplate = handlebars.compile(template);

// Generate an HTML file for each page with its metadata
Object.values(pages).forEach(pageConfig => {
    // Compile the template with page metadata
    const html = compiledTemplate({
        title: pageConfig.title,
        lang: pageConfig.lang,
        meta: pageConfig.meta,
        structuredData: pageConfig.structuredData || null,
        scripts: {
            head: pageConfig.scripts.head,
            body: pageConfig.scripts.body,
        },
        alternateLinks: pageConfig.alternateLinks,
        cacheVersion: pageConfig.cacheVersion,
        baseTag: pageConfig.baseTag,
    });

    // Save output html for each page
    if (!fs.existsSync(pageConfig.outputDir)) {
        fs.mkdirSync(pageConfig.outputDir, { recursive: true });
    }
    fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
});

const rollupOptionsInput = {};
for (const pageName in pages) {
    rollupOptionsInput[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

export default defineConfig(() => {
    return {
        plugins: [nodePolyfills({ include: ['events', 'stream', 'string_decoder'] }), vue()],
        base: "/",
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [autoprefixer],
            },
        },
        build: {
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                input: rollupOptionsInput,
                onwarn: (entry, next) => {
                    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
                    return next(entry);
                },
                maxParallelFileOps: 900,
            },
        },
        logLevel: 'warn',
    };
});

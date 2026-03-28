# npm run build --configuration=production BEFORE BUILDING THE DOCKER IMAGE
FROM nginx:alpine

COPY dist/etudiant-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
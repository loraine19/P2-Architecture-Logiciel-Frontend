# npm run build --configuration=production BEFORE BUILDING THE DOCKER IMAGE
FROM nginx:alpine

# Copy built Angular app
COPY dist/etudiant-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
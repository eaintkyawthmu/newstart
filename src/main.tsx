import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initPerformanceOptimizations } from './utils/performance';
import { initErrorTracking } from './utils/errorTracking';
import { initBrowserCompatibility } from './utils/browserCompat';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
    },
  },
});

// Initialize performance monitoring and error tracking
initPerformanceOptimizations();
initErrorTracking();
initBrowserCompatibility();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, show update notification
                const updateAvailable = document.createElement('div');
                updateAvailable.innerHTML = `
                  <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #3B82F6;
                    color: white;
                    padding: 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000;
                    max-width: 300px;
                  ">
                    <div style="font-weight: 600; margin-bottom: 8px;">Update Available</div>
                    <div style="font-size: 14px; margin-bottom: 12px;">A new version is ready to install.</div>
                    <div style="display: flex; gap: 8px;">
                      <button id="update-btn" style="
                        background: white;
                        color: #3B82F6;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-weight: 600;
                        cursor: pointer;
                      ">Update</button>
                      <button id="dismiss-update-btn" style="
                        background: transparent;
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                      ">Later</button>
                    </div>
                  </div>
                `;
                
                document.body.appendChild(updateAvailable);
                
                document.getElementById('update-btn')?.addEventListener('click', () => {
                  window.location.reload();
                });
                
                document.getElementById('dismiss-update-btn')?.addEventListener('click', () => {
                  updateAvailable.remove();
                });
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      window.location.reload();
    }
  });
}

// Add to home screen prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt available');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show custom install button or notification
  showInstallPromotion();
});

function showInstallPromotion() {
  // Create a subtle install promotion
  const installBanner = document.createElement('div');
  installBanner.setAttribute('role', 'banner');
  installBanner.setAttribute('aria-label', 'Install app promotion');
  installBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #0CB6A9;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 400px;
      margin: 0 auto;
      animation: slideUp 0.3s ease-out;
    ">
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Install My New Start</div>
        <div style="font-size: 14px; opacity: 0.9;">Get quick access from your home screen</div>
      </div>
      <div>
        <button id="install-btn" style="
          background: white;
          color: #0CB6A9;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 8px;
          transition: all 0.2s ease;
        ">Install</button>
        <button id="dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        ">×</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Handle install button click
  document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    }
    style.remove();
    installBanner.remove();
  });
  
  // Handle dismiss button click
  document.getElementById('dismiss-btn')?.addEventListener('click', () => {
    style.remove();
    installBanner.remove();
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(installBanner)) {
      style.remove();
      installBanner.remove();
    }
  }, 10000);
}

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA was installed successfully');
  // Track installation analytics here if needed
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('App is online');
  
  // Show online notification
  const onlineNotification = document.createElement('div');
  onlineNotification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #10B981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    ">
      ✅ Back online
    </div>
  `;
  
  document.body.appendChild(onlineNotification);
  setTimeout(() => onlineNotification.remove(), 3000);
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  
  // Show offline notification
  const offlineNotification = document.createElement('div');
  offlineNotification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #EF4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    ">
      ⚠️ You're offline
    </div>
  `;
  
  document.body.appendChild(offlineNotification);
  setTimeout(() => offlineNotification.remove(), 5000);
});
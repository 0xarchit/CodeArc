// components/network/NetworkStatus.tsx
import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import { PluginListenerHandle } from "@capacitor/core";
import { isPlatform } from "@ionic/react";

export const NetworkStatus = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let listenerHandle: PluginListenerHandle | undefined;

    const updateNetworkStatus = async () => {
      try {
        if (isPlatform("capacitor")) {
          const status = await Network.getStatus();
          setIsOnline(status.connected);
        } else {
          setIsOnline(navigator.onLine);
        }
      } catch (error) {
        console.error("Error checking network status:", error);
        setIsOnline(true);
      }
    };

    const setupListeners = async () => {
      await updateNetworkStatus();

      if (isPlatform("capacitor")) {
        listenerHandle = await Network.addListener(
          "networkStatusChange",
          (status) => {
            setIsOnline(status.connected);
          }
        );
      } else {
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);
      }
    };

    setupListeners();

    return () => {
      if (isPlatform("capacitor") && listenerHandle) {
        listenerHandle.remove();
      } else {
        window.removeEventListener("online", updateNetworkStatus);
        window.removeEventListener("offline", updateNetworkStatus);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className={isOnline ? "" : "pointer-events-none opacity-50"}>
        {children}
      </div>
      {!isOnline && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-red-600 text-white p-6 rounded-lg shadow-lg text-center max-w-sm mx-4">
            <h2 className="text-2xl font-bold mb-4">No Internet Connection</h2>
            <p className="text-lg">
              Please connect to the internet to use this app.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

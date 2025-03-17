import React, { useState, useEffect } from 'react';
import { IonModal, IonButton, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { checkForUpdates } from '../services/UpdateChecker';
import { App } from '@capacitor/app';

export default function UpdatePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [updateUrl, setUpdateUrl] = useState('');

  useEffect(() => {
    (async () => {
      const info = await App.getInfo();
      const { hasUpdate, updateUrl } = await checkForUpdates(info.version);
      if (hasUpdate && updateUrl) {
        setUpdateUrl(updateUrl);
        setIsOpen(true);
      }
    })();
  }, []);

  return (
    <IonModal isOpen={isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Update Available</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <p>A new version is available.</p>
        <IonButton onClick={() => window.open(updateUrl, '_blank')}>Update Now</IonButton>
        <IonButton onClick={() => setIsOpen(false)}>Later</IonButton>
      </IonContent>
    </IonModal>
  );
}

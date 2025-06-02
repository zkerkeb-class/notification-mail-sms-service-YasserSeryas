const emailTemplates = {
    // Confirmation de réservation
    'reservation-confirmation': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Confirmation de votre réservation</h2>
          <p>Bonjour {{userName}},</p>
          <p>Votre réservation pour l'événement <strong>{{eventName}}</strong> a été confirmée.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Détails de la réservation :</h3>
            <p><strong>Numéro de réservation :</strong> {{reservationNumber}}</p>
            <p><strong>Événement :</strong> {{eventName}}</p>
            <p><strong>Date :</strong> {{eventDate}}</p>
            <p><strong>Lieu :</strong> {{eventLocation}}</p>
            <p><strong>Nombre de billets :</strong> {{ticketCount}}</p>
            <p><strong>Montant total :</strong> {{totalAmount}}€</p>
          </div>
          
          <p>Vos billets électroniques sont en pièce jointe.</p>
          <p>Merci de votre confiance !</p>
        </div>
      `,
      text: `
        Confirmation de votre réservation
        
        Bonjour {{userName}},
        
        Votre réservation pour l'événement {{eventName}} a été confirmée.
        
        Numéro de réservation : {{reservationNumber}}
        Événement : {{eventName}}
        Date : {{eventDate}}
        Lieu : {{eventLocation}}
        Nombre de billets : {{ticketCount}}
        Montant total : {{totalAmount}}€
        
        Merci de votre confiance !
      `
    },
  
    // Rappel d'événement
    'event-reminder': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Rappel : Votre événement commence bientôt !</h2>
          <p>Bonjour {{userName}},</p>
          <p>N'oubliez pas que votre événement <strong>{{eventName}}</strong> commence dans {{timeUntilEvent}}.</p>
          
          <div style="background-color: #e8f4fd; padding: 20px; margin: 20px 0;">
            <h3>Détails de l'événement :</h3>
            <p><strong>Événement :</strong> {{eventName}}</p>
            <p><strong>Date et heure :</strong> {{eventDateTime}}</p>
            <p><strong>Lieu :</strong> {{eventLocation}}</p>
          </div>
          
          <p>Assurez-vous d'avoir vos billets avec vous !</p>
        </div>
      `
    },
  
    // Annulation d'événement
    'event-cancellation': {
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Annulation d'événement</h2>
          <p>Bonjour {{userName}},</p>
          <p>Nous sommes désolés de vous informer que l'événement <strong>{{eventName}}</strong> prévu le {{eventDate}} a été annulé.</p>
          
          <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>Raison de l'annulation :</strong> {{cancellationReason}}</p>
            <p><strong>Montant remboursé :</strong> {{refundAmount}}€</p>
            <p><strong>Délai de remboursement :</strong> 5-7 jours ouvrés</p>
          </div>
          
          <p>Nous nous excusons pour cette gêne occasionnée.</p>
        </div>
      `
    }
  };
  
  module.exports = emailTemplates;
  
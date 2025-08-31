const smsTemplates = {
    'reservation-confirmation': {
      content: `Réservation confirmée ! {{eventName}} le {{eventDate}} à {{eventLocation}}. Réf: {{reservationNumber}}. Billets reçus par email.`
    },
  
    'event-reminder': {
      content: `Rappel: {{eventName}} commence dans {{timeUntilEvent}} ! Lieu: {{eventLocation}}. N'oubliez pas vos billets !`
    },
  
    'event-cancellation': {
      content: `ANNULATION: {{eventName}} du {{eventDate}} est annulé. Remboursement de {{refundAmount}}€ en cours. Désolé pour la gêne.`
    },
  
    'payment-confirmation': {
      content: `Paiement de {{amount}}€ confirmé pour {{eventName}}. Réf: {{reservationNumber}}.`
    }
  };
  
  export default smsTemplates;
  
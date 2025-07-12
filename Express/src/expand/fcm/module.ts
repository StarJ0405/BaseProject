var fcm = require("firebase-admin");

export function init(DEV: boolean) {
  const firebase = process.env.firebase;
  if (!firebase) {
    console.error("Firebase 인증서가 없습니다");
    process.exit(1);
  }

  var serviceAccount = require(firebase);

  if (fcm.apps.length === 0) {
    fcm.initializeApp({
      credential: fcm.credential.cert(serviceAccount),
    });
  } else {
    fcm.app();
  }
}

interface FCMMessageInterface {
  notification: {
    title: string;
    body: string;
  };
  data: {
    link: string;
  };
}
export function sendPopupMessageByCondition(
  message: FCMMessageInterface,
  condition: string
) {
  if (!fcm) return;
  fcm.messaging().send({ ...message, condition });
}

export function sendPopupMessageByTopic(
  message: FCMMessageInterface,
  topic: string
) {
  if (!fcm) return;
  fcm.messaging().send({ ...message, topic });
}

export function sendPopupMessageByToken(
  message: FCMMessageInterface,
  token: string | string[],
  deleteMethod?: (token: string) => void
) {
  if (!fcm) return;
  if (Array.isArray(token)) {
    fcm
      .messaging()
      .sendEachForMulticast({ ...message, tokens: token })
      .then((res: any) => {
        res.responses?.forEach(async (res: any, index: number) => {
          if (
            res?.error?.errorInfo?.code ===
            "messaging/registration-token-not-registered"
          ) {
            // 만약 토큰을 기록하는 경우 삭제 관련 로직
            deleteMethod?.(token[index]);
          }
        });
      });
  } else {
    fcm
      .messaging()
      .send({ ...message, token })
      .catch(async (err: any) => {
        if (err?.errorInfo?.code) {
          if (
            err?.errorInfo?.code ===
            "messaging/registration-token-not-registered"
          ) {
            // 만약 토큰을 기록하는 경우 삭제 관련 로직
            deleteMethod?.(token);
          }
        }
      });
  }
}

export default fcm;

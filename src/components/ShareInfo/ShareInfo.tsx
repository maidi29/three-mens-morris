import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { Player, Room, useStore } from "../../store/store";
import styles from "./ShareInfo.module.scss";
import { Game } from "../Game/Game";
import { Start } from "../Start/Start";
import { Collapsible } from "../Collapsible/Collapsible";
import { copyToClipboard } from "../../utils/helper";

export const ShareInfo = (): JSX.Element => {
  const room = useStore((state) => state.room);
  const opponent = useStore((state) => state.opponent);

  return (
    <div className={styles.shareInfo}>
      <h2>Game ID: {room?.roomId}</h2>
      {!opponent && (
        <button
          className={styles.shareButton}
          onClick={() => {
            if (navigator.share) {
              navigator
                .share({
                  title: "Invite",
                  text: "Play Three Men's Morris with me!",
                  url: `${window.location}?id=${room?.roomId}`,
                })
                .catch(() =>
                  alert(
                    `Failed to share the invite link ${window.location}?id=${room?.roomId}. Please copy it yourself or tell them the Game ID to enter it manually.`
                  )
                );
            } else {
              copyToClipboard(`${window.location}?id=${room?.roomId}`).then(
                () =>
                  toast(
                    `The invite link ${window.location}?id=${room?.roomId} was copied to clipboard.`,
                    {
                      icon: "📋",
                      duration: 10000,
                    }
                  ),
                () =>
                  alert(
                    `Failed to copy the invite link ${window.location}?id=${room?.roomId}. Please copy it yourself or tell them the Game ID to enter it manually.`
                  )
              );
            }
          }}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22 6a4 4 0 10-7.912.838L9.017 9.373a4 4 0 10-.329 5.589l5.33 2.665a4 4 0 10.686-1.893l-4.912-2.456a3.996 3.996 0 00.12-2.116l5.071-2.535A4 4 0 0022 6z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

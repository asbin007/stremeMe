import { useEffect, useState } from "react";

/** The slice of the Network Information API we use. Not in lib.dom yet. */
interface NetworkInformation extends EventTarget {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

function getConnection(): NetworkInformation | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

/**
 * True when the viewer has asked for reduced data use, or is on a connection
 * too slow to spend bandwidth on decoration.
 *
 * The homepage autoplays a YouTube trailer per hero slide, and the carousel
 * advances on its own — an unbroken video stream nobody asked for. On a metered
 * mobile plan, which is how much of this audience browses, that is real money.
 * Chrome on Android exposes Data Saver through this API, and it is widely
 * enabled in India and Nepal.
 *
 * Safari and Firefox do not implement it; there the hook reports false and
 * behaviour is unchanged.
 */
export function useSaveData(): boolean {
  const [saveData, setSaveData] = useState(() => {
    const connection = getConnection();
    if (!connection) return false;

    return (
      connection.saveData === true ||
      connection.effectiveType === "slow-2g" ||
      connection.effectiveType === "2g" ||
      connection.effectiveType === "3g"
    );
  });

  useEffect(() => {
    const connection = getConnection();
    if (!connection) return;

    // Connection quality changes as people move between wifi and mobile.
    const update = () => {
      setSaveData(
        connection.saveData === true ||
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g" ||
          connection.effectiveType === "3g"
      );
    };

    connection.addEventListener("change", update);
    return () => connection.removeEventListener("change", update);
  }, []);

  return saveData;
}

export default useSaveData;

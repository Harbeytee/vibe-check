// import { useEffect, useRef } from "react";
// import { useGame } from "@/context/game-context";
// import { useParams, useRouter } from "next/navigation";

// /**
//  * Hook to verify player is still in an active room
//  *
//  */
// export const useRoomVerification = (enabled: boolean = true) => {
//   const { room, player, verifyRoomMembership, socket } = useGame();
//   const router = useRouter();
//   const hasVerified = useRef(false);
//   const { code } = useParams();

//   useEffect(() => {
//     // Only run once when component mounts and socket is connected
//     if (!enabled || hasVerified.current || !socket?.connected) {
//       return;
//     }

//     const verify = async () => {
//       console.log("🔍 Verifying room membership...");

//       // If no room or player data, redirect immediately
//       if (!room?.code || !player?.name) {
//         console.log("❌ No room/player data found");
//         router.push(`/${code ? `?${code}` : ""}`);
//         return;
//       }

//       // Verify with backend
//       const isValid = await verifyRoomMembership();

//       if (!isValid) {
//         console.log("❌ Room verification failed - redirecting to home");
//         router.push(`/${code ? `?${code}` : ""}`);
//       } else {
//         console.log("✅ Room verification successful");
//       }

//       hasVerified.current = true;
//     };

//     verify();
//   }, [enabled, room, player, socket?.connected, verifyRoomMembership, router]);
// };

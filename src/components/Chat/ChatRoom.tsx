// client/src/components/Chat/ChatRoom.tsx
import React from "react";
import {useSpring, animated} from "@react-spring/web";

const ChatRoom = () => {
  const fadeIn = useSpring({
    from: {opacity: 0},
    to: {opacity: 1},
    config: {duration: 500},
  });

  return (
    <animated.div style={fadeIn}>
      <h2>Chat Room</h2>
      {/* Chat room content */}
    </animated.div>
  );
};

export default ChatRoom;

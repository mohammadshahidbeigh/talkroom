// client/src/components/Layout/Header.tsx
import React from "react";
import {useSpring, animated} from "@react-spring/web";
import {FaHome, FaUser, FaCog} from "react-icons/fa";

const Header = () => {
  const headerAnimation = useSpring({
    from: {opacity: 0, transform: "translateY(-50px)"},
    to: {opacity: 1, transform: "translateY(0)"},
    config: {tension: 300, friction: 10},
  });

  return (
    <animated.header style={headerAnimation}>
      <h1>Your App</h1>
      <nav>
        <ul>
          <li>
            <FaHome /> Home
          </li>
          <li>
            <FaUser /> Profile
          </li>
          <li>
            <FaCog /> Settings
          </li>
        </ul>
      </nav>
    </animated.header>
  );
};

export default Header;

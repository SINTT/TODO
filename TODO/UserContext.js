import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ip, setIp] = useState('http://192.168.0.101:4000');

  return (
    <UserContext.Provider value={{ user, setUser, ip, setIp }}>
      {children}
    </UserContext.Provider>
  );
};

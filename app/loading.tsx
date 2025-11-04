"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Loading: React.FC =() => {
const [isloading, setLoading]=useState(true)
useEffect(()=>{
  const timer=setTimeout(()=>setLoading(false), 2000);
 return()=> clearTimeout(timer)
})


  return (
<AnimatePresence>
  {isloading&&(
    <motion.div
      className="flex items-center justify-center h-screen bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-1 text-lg font-medium text-gray-800">
        <span>Loading</span>
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full inline-block"
            initial={{ backgroundColor: "#BBF7D0" }}
            animate={{ backgroundColor: ["#BBF7D0", "#065F46", "#BBF7D0"] }}
            transition={{
              duration: 1,
              delay,
              repeat: Infinity,
              repeatDelay: 0.1,
            }}
          />
        ))}
      </div>
    </motion.div>)}
    </AnimatePresence>
  );
};

export default Loading;

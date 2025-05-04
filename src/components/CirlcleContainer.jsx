import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 10,
      stiffness: 100,
    },
  },
};

const CircleContainer = () => (
  <motion.div
    className="absolute top-0 lg:relative flex w-[700px] h-[550px]"
    initial="hidden"
    animate="show"
    variants={containerVariants}
  >
    <motion.div
      className="absolute right-16 top-16 w-[250px] h-[250px] bg-[#737373]/50 rounded-full"
      variants={circleVariants}
    />
    <motion.div
      className="absolute right-0 w-[380px] h-[380px] bg-[#737373]/5 border-[1px] outline-none outline-[#737373]/10 border-[#737373]/20 backdrop-blur-2xl shadow-[#0d0d0d] shadow-2xl rounded-full"
      variants={circleVariants}
    />

    <motion.div
      className="absolute left-[230px] bottom-12 w-[250px] h-[250px] bg-green-500/50 rounded-full"
      variants={circleVariants}
    />
    <motion.div
      className="absolute left-[175px] bottom-0 w-[350px] h-[350px] bg-green-400/5 border-[1px] outline-none outline-green-500/10 border-green-500/20 backdrop-blur-2xl shadow-[#0d0d0d] shadow-2xl rounded-full"
      variants={circleVariants}
    />

    <motion.div
      className="absolute w-[150px] h-[150px] left-[80px] top-[80px] bg-red-500/50 rounded-full"
      variants={circleVariants}
    />
    <motion.div
      className="absolute w-[300px] h-[300px] bg-red-400/5 border-[1px] outline-none outline-red-500/10 border-red-500/20 backdrop-blur-2xl rounded-full"
      variants={circleVariants}
    />

    <motion.div
      className="absolute bottom-[90px] right-[125px] w-[150px] h-[150px] bg-[#c77bbf]/50 rounded-full"
      variants={circleVariants}
    />
    <motion.div
      className="absolute bottom-10 right-[80px] w-[250px] h-[250px] bg-[#c77bbf]/5 border-[1px] outline-none outline-[#c77bbf]/10 border-[#c77bbf]/20 backdrop-blur-2xl rounded-full"
      variants={circleVariants}
    />

    <motion.div
      className="absolute right-[340px] top-[175px] w-[50px] h-[50px] bg-[#9966ff]/50 rounded-full"
      variants={circleVariants}
    />
    <motion.div
      className="absolute right-[315px] top-[150px] w-[100px] h-[100px] bg-[#9966ff]/5 border-[1px] outline-none outline-[#9966ff]/10 border-[#9966ff]/20 backdrop-blur-lg rounded-full"
      variants={circleVariants}
    />

    <motion.div
      className="page-logo hidden absolute lg:flex w-[700px] h-[550px] bg-[#9966ff]/0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="flex flex-col justify-center items-center bg-gradient-to-t border-[1px] border-[#9966ff] from-[#220066]/3 to-[#9966ff]/3 backdrop-blur-2xl p-5 rounded-2xl">
        <h1 className="text-8xl text-[#9966ff] font-semibold">Rhine</h1>
        <p className="text-2xl font-semibold text-[#a6a6a6]">. .Task Manger. .</p>
      </div>
    </motion.div>
  </motion.div>
);

export default CircleContainer;

import { motion } from 'framer-motion'
import { MessageSquarePlus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import heroFlood from '@/assets/hero-flood.jpg'
import { Button } from '@/components/ui/button'
import { useLandingStats } from '@/hooks/use-stats'

const Landing = () => {
  const navigate = useNavigate()
  const { data: stats = { totalReports: 0, helpedCount: 0, urgentCount: 0 } } =
    useLandingStats()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section
        className="relative overflow-hidden py-12 md:py-16 px-4 min-h-screen flex items-center"
        style={{
          backgroundImage: `url(${heroFlood})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Black overlay with 50% opacity */}
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          className="max-w-6xl mx-auto text-center relative z-10 w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight px-4"
          >
            Thai Flood Help
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-white/95 mb-2 md:mb-3 font-medium px-4 max-w-4xl mx-auto"
          >
            เว็บไซต์ที่ช่วยรวบรวมข้อมูลที่กระจัดกระจายตามช่องทางต่างๆ
            <br />
            โดยให้ AI สกัดออกมาเป็นประเด็นสำคัญ
            เพื่อให้การช่วยเหลือได้รวดเร็วขึ้น
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-white/80 mb-4 md:mb-6 px-4"
          >
            ทุกวินาที • มีคนรอความช่วยเหลือ
          </motion.p>

          {/* Technology Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 text-xs sm:text-sm px-4"
          >
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🎧 Social Listening
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              👥 Crowd Sourcing
            </div>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 whitespace-nowrap">
              🤖 AI Technology
            </div>
          </motion.div>

          {/* Real-time Stats with Glassmorphism */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto mb-6 md:mb-8 px-4 justify-items-center sm:justify-items-stretch"
          >
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                {stats.totalReports}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                รายงานในระบบ
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-lg rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
                {stats.urgentCount}
              </div>
              <div className="text-xs sm:text-sm text-white/80">
                เคสเร่งด่วน
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 md:gap-4 justify-center items-center max-w-2xl mx-auto"
          >
            {/* Primary CTA - ช่วยใส่ข้อมูล */}
            <div className="w-full px-4">
              <Button
                size="lg"
                className="w-full text-sm sm:text-base md:text-lg h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl shadow-orange-500/50 font-bold rounded-lg md:rounded-xl border-2 border-white/30 transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/extraction')}
              >
                <MessageSquarePlus className="mr-2 h-4 sm:h-5 md:h-6 w-4 sm:w-5 md:w-6 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-sm sm:text-base md:text-lg">
                    ช่วยใส่ข้อมูลจาก Social
                  </span>
                  <span className="text-xs font-normal opacity-90 hidden sm:block">
                    คุณสามารถช่วยชีวิตได้ด้วยการใส่ข้อมูล
                  </span>
                </div>
              </Button>
            </div>

            {/* Secondary CTA - ค้นหา */}
            <div className="w-full flex gap-3 px-4">
              <Button
                size="lg"
                className="flex-1 text-xs sm:text-sm md:text-base h-10 sm:h-12 px-3 sm:px-4 md:px-6 bg-white text-blue-600 hover:bg-white/90 shadow-xl font-semibold rounded-lg"
                onClick={() => navigate('/dashboard')}
              >
                <Search className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">ค้นหาผู้ต้องการความช่วยเหลือ</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default Landing

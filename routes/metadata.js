const express = require("express");
const router = express.Router();

const { getCurrentSong } =
require("../services/zenoService");

router.get("/", async (req,res)=>{

    try{

      const song = await getCurrentSong();

      res.json(song);

    }catch(err){

      res.status(500).json({
        error:"Metadata unavailable"
      });

    }

});

module.exports = router;

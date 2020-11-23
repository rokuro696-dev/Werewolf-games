<template>
 <div>
   
  <html lang="ja">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="https://cdn.jsdelivr.net/npm/vue"></script>
    <link rel="manifest" href="manifest.json">
    <link rel="stylesheet" type="text/css" href="Rohkuroh.css">
    <title>Vue-PWA 2</title>
  </head>
  <body>
    <div class="full-page">
    <div class="announcement">
      <h2>あなたの役職は</h2>
      <h2 class="position">○○○○</h2>
      <!-- ↑役職をランダムで表示するコード要 -->
      <h2 class="position">です</h2>
    </div>
    <div>
      <a href="#" class="nextPage">話し合い開始</a>
    </div>
  </div>
  </body>

 </div>
 
</template>
 

<script>
    
</script>

<style>
.full-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: -webkit-linear-gradient(top right, #336B87, #90AFC5);
    }

    .announcement {
    padding: 20%;
    }

    .nextPage {
    display: inline-block;
    background: #336B87;
    margin-top: 20px;
    margin-bottom: 20px;
    padding: 10px 20px;
    width: 10em;
    height: 1.5em;
    font-size: 24px;
    text-decoration: none;
    color: #FFFFFF;
    transition: .4s;
    border-style: outset;
    border-color: #C4DFE6;
    }

    .position {
    display: inline-block;
    }
</style>

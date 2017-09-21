<template>
  <div id="builder">
    <!-- <script src="https://d3js.org/d3.v4.min.js"></script> -->
    <h1>Gameboard</h1>
    <div style="max-width: 550px; margin: 40px auto;background: white; color: black;">

<noscript type="text/javascript">


</noscript>
  


<svg id="canvas" v-bind:height="canvasHeight" v-bind:width="canvasWidth">
  <defs>

    <!--     <style type="text/css">
      .st0{fill:url(#SVGID_1_);stroke: darkgray; stroke-width: 0.5;}
      .st1{fill:url(#SVGID_2_);}
      .st2{fill:url(#SVGID_3_);}
      .st3{fill:url(#SVGID_4_);}
      .st4{fill:#606060;}
      .st5{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
      .st6{fill:url(#SVGID_5_);}
      .st7{fill:#FFFFFF;}
      .st8{font-family:'Helvetica';}
      .st9{font-size:5px;}
      .st10{font-size:13px;}
      .st11{font-size:15px;}

      .trä{background-color: #1abc9c;}
      .sten{background-color: #FFFFFF;}
      .olja{background-color: #B697D8;}
      .säd{background-color: #f1c40f;}
      .djur{background-color: #75B96B;}


    </style> -->

    <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="0.8787" y1="0.8787" x2="24.1213" y2="24.1213">
      <stop  offset="0" style="stop-color:#FFFFFF"/>
      <stop  offset="1" style="stop-color:#CAC9DA"/>
    </linearGradient>

    <symbol id="svg-säd">
      <path fill="#000" d="M72.664,40.963c-0.343-0.185-0.771-0.062-0.961,0.277c-5.583,9.896-14.78,25.852-16.126,27.315
        c-1.014,0.278-2.257,0.795-3.178,1.718v-3.696c0.348,0.145,0.726,0.222,1.132,0.222c1.649,0,3.502-1.24,4.721-3.159
        c0.958-1.511,0.845-3.418,0.568-4.784c0.253-1.636,6.105-18.578,10.024-29.701c0.129-0.367-0.06-0.77-0.424-0.907
        c-0.366-0.136-0.771,0.045-0.915,0.407c-2.808,7.101-6.91,17.229-9.558,23.32c0.337-1.309,0.143-2.7-0.137-3.75
        c-0.035-1.468,2.45-20.182,4.144-32.503c0.054-0.386-0.213-0.743-0.598-0.803c-0.387-0.059-0.747,0.201-0.813,0.584
        c-1.927,11.104-5.239,29.029-6.153,31.167c-0.631,0.218-1.341,0.536-1.991,0.986v-0.25c0-0.371-0.078-0.723-0.218-1.043
        c0.806-1.005,1.338-2.476,1.396-4.146c0.062-1.769-0.975-3.34-1.896-4.379c-0.432-1.888-1.159-20.832-1.547-33.312
        c-0.013-0.389-0.349-0.707-0.724-0.692c-0.39,0.005-0.703,0.321-0.705,0.711c-0.054,11.973-0.308,31.366-0.764,33.336
        c-0.917,0.939-1.971,2.376-2.029,4.065c-0.052,1.453,0.264,2.843,0.887,3.913c0.153,0.262,0.322,0.495,0.502,0.706
        c-0.09,0.264-0.141,0.547-0.141,0.841v0.019c-0.546-0.328-1.112-0.576-1.627-0.754c-0.915-2.137-4.228-20.062-6.153-31.167
        c-0.067-0.383-0.429-0.642-0.814-0.583c-0.385,0.06-0.651,0.417-0.598,0.803c1.693,12.321,4.179,31.037,4.143,32.503
        c-0.279,1.051-0.474,2.444-0.134,3.755c-2.648-6.091-6.752-16.222-9.561-23.325c-0.143-0.362-0.549-0.542-0.914-0.407
        c-0.365,0.137-0.553,0.54-0.424,0.907c3.919,11.123,9.771,28.065,10.024,29.701c-0.277,1.366-0.39,3.273,0.568,4.784
        c1.217,1.919,3.07,3.159,4.72,3.159c0.269,0,0.524-0.035,0.769-0.099v3.241c-0.869-0.717-1.928-1.143-2.814-1.386
        c-1.346-1.462-10.543-17.419-16.125-27.315c-0.191-0.338-0.618-0.461-0.962-0.277c-0.342,0.185-0.474,0.61-0.295,0.956
        c5.453,10.572,13.621,26.697,14.132,28.48c-0.271,1.363-0.374,3.249,0.576,4.747c1.217,1.919,3.07,3.158,4.72,3.158
        c0.269,0,0.524-0.034,0.769-0.098v16.341c0,1.446,1.173,2.619,2.619,2.619c1.447,0,2.62-1.173,2.62-2.619V78.083
        c0.348,0.145,0.726,0.222,1.132,0.222c0.001,0,0,0,0.001,0c1.648,0,3.501-1.239,4.72-3.158c0.949-1.498,0.848-3.384,0.576-4.747
        c0.511-1.783,8.679-17.908,14.132-28.48C73.139,41.573,73.007,41.148,72.664,40.963z M55.537,57.062
        c-1.006,0.28-2.229,0.795-3.138,1.705v-2.304c0.132,0.019,0.267,0.029,0.404,0.029c0,0,0,0,0.001,0c1.604,0,3.339-1.192,4.506-3.067
        C56.469,55.318,55.837,56.637,55.537,57.062z M47.12,56.492c0.014,0,0.027-0.002,0.041-0.002v1.945
        c-0.856-0.706-1.897-1.13-2.774-1.374c-0.3-0.425-0.934-1.745-1.777-3.643C43.777,55.298,45.513,56.492,47.12,56.492z"/>
    </symbol>

    <symbol id="svg-olja">
      <path fill="#000033" d="M69.776,44.623c-2.253-4.504-5.584-8.945-8.804-13.239c-3.057-4.076-6.219-8.291-8.223-12.3L50,13.585
        l-2.75,5.499c-2.004,4.009-5.166,8.224-8.223,12.3c-3.221,4.294-6.552,8.735-8.804,13.239c-4.581,9.162-4.581,13.443-4.581,18.401
        c0,13.431,10.927,24.356,24.357,24.356c13.43,0,24.356-10.926,24.356-24.356C74.356,58.066,74.356,53.785,69.776,44.623z"/>
      <path fill="#FFFFFF" d="M58.514,75.794c-2.915,0-5.692-0.588-8.222-1.648c0.167-1.264-0.015-2.734-0.596-4.189
        c-1.31-3.273-4.141-5.221-6.324-4.347c-0.794,0.317-1.39,0.967-1.768,1.82c-2.741-3.583-4.374-8.059-4.374-12.919
        c0-2.567,0.001-4.828,0.656-7.683c-0.238,0.429-0.468,0.858-0.682,1.285c-3.757,7.515-3.757,10.457-3.757,14.912
        c0,9.127,7.426,16.553,16.553,16.553c4.051,0,7.765-1.465,10.646-3.89C59.943,75.757,59.232,75.794,58.514,75.794z"/>
    </symbol>

    <symbol id="svg-trä">
      <g>
        <polygon fill="#683C11" points="13.573,69.366 18.366,68.671 11.071,67.848   "/>
        <polygon fill="#683C11" points="22.506,66.767 21.318,68.242 25.96,67.568 26.274,67.244 23.868,67.594  "/>
        <polygon fill="#432918" points="28.1,63.431 28.139,63.262 25.792,62.686 22.506,66.767 23.868,67.594 26.274,67.244 
          30.816,66.586   "/>
        <polygon fill="#432918" points="29.26,58.377 25.792,62.686 28.139,63.262 30.072,54.886 28.295,55.916  "/>
        <polygon fill="#936037" points="30.389,53.509 30.706,52.138 29.649,52.234   "/>
        <polygon fill="#7D4E24" points="28.548,50.339 29.649,52.234 30.706,52.138 31.165,50.149 30.691,50.689   "/>
        <polygon fill="#7D4E24" points="28.548,50.339 28.312,50.299 27.042,50.42 26.253,50.71 28.295,55.916 30.072,54.886 
          30.389,53.509 29.649,52.234   "/>
        <polygon fill="#683C11" points="5.081,49.096 6.557,50.711 9.027,47.644  "/>
        <polygon fill="#683C11" points="26.171,50.502 26.253,50.71 27.042,50.42   "/>
        <path fill="#FFE0AE" d="M25.792,62.686l3.468-4.309l-0.965-2.461l-2.042-5.206l-0.082-0.208l-2.672,0.252l-2.445-1.643
          l-3.532-0.578l-1.097-3.131l-5.129-0.578l-2.269,2.819l-2.47,3.068l-3.765,4.677l4.73,12.059l3.549,0.4l7.295,0.823l2.39,0.27
          l0.562-0.698l1.188-1.476L25.792,62.686z M11.432,56.632c-0.257-2.538,1.646-4.903,4.252-5.281
          c2.606-0.379,4.928,1.374,5.186,3.911c0.258,2.541-1.645,4.906-4.251,5.284S11.69,59.172,11.432,56.632z"/>
        <path fill="#7D4E24" d="M20.869,55.262c-0.257-2.537-2.579-4.29-5.186-3.911c-2.606,0.378-4.509,2.743-4.252,5.281
          c0.258,2.54,2.58,4.292,5.186,3.914S21.127,57.803,20.869,55.262z"/>
        <polygon fill="#683C11" points="28.312,50.299 21.054,49.112 23.499,50.754 26.171,50.502 27.042,50.42  "/>
        <polygon fill="#432918" points="58.568,43.581 56.874,43.741 57.627,44.46 57.648,44.46   "/>
        <polygon fill="#432918" points="49.652,42.471 49.998,42.801 50.226,42.801 45.722,39.773 47.356,38.225 45.629,38.389 
          43.227,36.774 40.964,36.869 38.681,38.055 39.559,40.562 37.887,42.471   "/>
        <polygon fill="#432918" points="56.511,35.155 53.922,37.605 47.356,38.225 45.722,39.773 50.226,42.801 55.892,42.801 
          56.874,43.741 58.568,43.581 58.955,43.21 60.776,38.162 68.17,36.303 67.369,35.765 64.288,35.894 59.887,33.95 59.887,33.95 
          59.886,33.95 57.948,35.094  "/>
        <polygon fill="#1D1D1B" points="70.635,37.959 68.17,36.303 60.776,38.162 58.955,43.21 60.051,42.163 68.369,42.163 
          68.692,42.471 78.768,42.471 79.193,42.877 81.955,41.526 83.166,38.168 79.177,36.94 78.928,37.176  "/>
        <polygon fill="#683C11" points="59.887,33.95 64.288,35.894 67.369,35.765 66.269,35.025 70.195,31.307 78.487,30.524 
          81.494,32.544 82.519,31.938 75.917,29.022 66.26,29.426 67.902,31.486  "/>
        <polygon fill="#683C11" points="56.511,35.155 57.948,35.094 59.886,33.95 57.751,33.822 57.85,33.888   "/>
        <polygon fill="#683C11" points="47.733,36.586 43.227,36.774 45.629,38.389 47.356,38.225 53.922,37.605 56.511,35.155 
          57.85,33.888 57.751,33.822 52.902,33.532  "/>
        <polygon fill="#7D4E24" points="70.195,31.307 66.269,35.025 67.369,35.765 68.17,36.303 70.635,37.959 78.928,37.176 
          79.177,36.94 82.854,33.458 81.494,32.544 78.487,30.524  "/>
        <polygon fill="#936037" points="41.344,36.672 40.964,36.869 43.227,36.774 47.733,36.586 52.902,33.532 49.409,33.323 
          49.219,33.084 47.431,34.141 40.163,34.444   "/>
        <polygon fill="#432918" points="49.219,33.084 49.409,33.323 52.902,33.532 57.751,33.822 59.886,33.95 59.887,33.95 59.887,33.95 
          67.902,31.486 66.26,29.426 65.439,28.397 54.962,27.771 50.032,29.286 53.245,30.706  "/>
        <polygon fill="#7D4E24" points="40.86,31.483 38.917,32.093 40.163,34.444 47.431,34.141 49.219,33.084 53.245,30.706 
          50.032,29.286 46.644,27.789 38.056,28.147   "/>
        <polygon fill="#7D4E24" points="41.344,36.672 40.163,34.444 38.917,32.093 36.823,32.751 38.681,38.055 40.964,36.869   "/>
        <polygon fill="#683C11" points="15.726,30.076 17.145,31.764 19.72,28.822  "/>
        <polygon fill="#683C11" points="35.256,28.276 36.823,32.751 38.917,32.093 40.86,31.483 38.056,28.147 37.769,27.806 
          29.584,27.348   "/>
        <path fill="#FFE0AE" d="M17.521,48.534l3.532,0.578l7.258,1.188l0.237,0.04l2.143,0.351l0.473-0.541l0.283-1.225l-0.512-0.489
          l6.239-5.964h0.712l1.672-1.91l-0.878-2.507l-1.857-5.304l-1.567-4.475l-5.672-0.928l-7.498-1.227l-2.366,2.702l-2.575,2.942
          l-3.926,4.484l3.206,9.155L17.521,48.534z M26.24,32.86c2.618-0.248,4.876,1.62,5.044,4.168c0.169,2.551-1.816,4.818-4.433,5.066
          c-2.617,0.246-4.875-1.62-5.044-4.171C21.639,35.375,23.624,33.107,26.24,32.86z"/>
        <path fill="#7D4E24" d="M21.807,37.924c0.168,2.551,2.427,4.417,5.044,4.171c2.617-0.248,4.602-2.515,4.433-5.066
          c-0.168-2.548-2.426-4.416-5.044-4.168C23.624,33.107,21.639,35.375,21.807,37.924z"/>
        <polygon fill="#683C11" points="47.573,42.801 49.998,42.801 49.652,42.471 37.887,42.471 37.174,42.471 30.936,48.435 
          31.447,48.924 31.58,48.347 44.567,44.306 45.213,45.057  "/>
        <polygon fill="#683C11" points="57.627,44.46 57.638,44.47 57.648,44.46  "/>
        <polygon fill="#683C11" points="57.648,44.46 57.638,44.47 60.051,46.778 59.3,47.496 60.744,47.772 66.29,42.471 68.692,42.471 
          68.369,42.163 60.051,42.163 58.955,43.21 58.568,43.581  "/>
        <polygon fill="#7D4E24" points="53.812,46.447 59.3,47.496 60.051,46.778 57.638,44.47 57.627,44.46 56.874,43.741 55.892,42.801 
          50.226,42.801 49.998,42.801 47.573,42.801 45.213,45.057 48.568,48.954   "/>
        <polygon fill="#936037" points="60.744,47.772 64.21,48.435 64.371,48.897 66.29,47.062 72.87,47.062 72.528,46.14 79.193,42.877 
          78.768,42.471 68.692,42.471 66.29,42.471  "/>
        <polygon fill="#432918" points="59.729,54.992 60.051,54.685 61.783,54.685 60.051,53.028 64.371,48.897 64.21,48.435 
          60.744,47.772 59.3,47.496 53.812,46.447 48.568,48.954 53.769,54.992   "/>
        <polygon fill="#7D4E24" points="75.166,53.253 72.87,47.062 66.29,47.062 64.371,48.897 60.051,53.028 61.783,54.685 
          68.369,54.685 70.771,56.981 72.528,56.981 74.607,58.969 78.768,54.992 82.283,54.992 82.66,54.633  "/>
        <polygon fill="#683C11" points="72.528,46.14 72.87,47.062 75.166,53.253 82.66,54.633 85.007,52.389 93.325,52.389 93.588,52.641 
          97.484,50.732 94.848,43.619 82.37,41.323 81.955,41.526 79.193,42.877  "/>
        <polygon fill="#683C11" points="85.007,60.343 80.848,56.365 82.283,54.992 78.768,54.992 74.607,58.969 74.609,58.97 
          82.927,62.946 81.541,66.923 91.245,66.923 97.484,60.957 95.084,58.661 93.325,60.343   "/>
        <polygon fill="#683C11" points="70.771,56.981 72.528,58.661 71.606,59.543 74.607,58.97 74.609,58.97 74.607,58.969 
          72.528,56.981   "/>
        <polygon fill="#683C11" points="72.528,58.661 70.771,56.981 68.369,54.685 61.783,54.685 60.051,54.685 59.729,54.992 
          62.131,54.992 67.677,60.294 71.606,59.543   "/>
        <polygon fill="#7D4E24" points="93.588,52.641 93.325,52.389 85.007,52.389 82.66,54.633 82.283,54.992 80.848,56.365 
          85.007,60.343 93.325,60.343 95.084,58.661 97.484,56.365   "/>
        <polygon fill="#936037" points="62.131,54.992 59.729,54.992 53.769,54.992 54.074,55.349 53.874,56.218 55.892,57.205 
          55.01,59.585 62.131,59.585 64.049,61.419 64.21,60.957 67.677,60.294   "/>
        <polygon fill="#432918" points="74.609,58.97 74.607,58.97 71.606,59.543 67.677,60.294 64.21,60.957 64.049,61.419 68.369,65.549 
          65.332,68.453 70.45,70.899 80.848,68.91 81.541,66.923 82.927,62.946   "/>
        <polygon fill="#7D4E24" points="64.049,61.419 62.131,59.585 55.01,59.585 53.427,63.856 55.892,65.063 53.5,71.516 62.131,71.516 
          65.332,68.453 68.369,65.549   "/>
        <polygon fill="#7D4E24" points="55.892,57.205 53.874,56.218 52.245,63.278 53.427,63.856 55.01,59.585  "/>
        <polygon fill="#683C11" points="30.936,69.655 35.298,71.791 31.695,67.606   "/>
        <polygon fill="#683C11" points="55.892,65.063 53.427,63.856 52.245,63.278 50.594,70.432 39.545,73.87 40.777,74.473 
          53.255,72.176 53.5,71.516   "/>
        <path fill="#FFE0AE" d="M50.594,70.432l1.651-7.153l1.629-7.061l0.2-0.869l-0.306-0.356l-5.2-6.039l-3.355-3.896l-0.646-0.751
          L31.58,48.347l-0.133,0.577l-0.283,1.225l-0.459,1.989l-0.316,1.371l-0.317,1.377l-1.933,8.376L28.1,63.431l2.716,3.155
          l0.879,1.021l3.603,4.185l2.309,2.682l1.938-0.603L50.594,70.432z M41.086,63.431c-2.625,0-4.753-2.472-4.753-5.521
          c0-3.05,2.128-5.521,4.753-5.521c2.626,0,4.753,2.472,4.753,5.521C45.84,60.959,43.712,63.431,41.086,63.431z"/>
        <ellipse fill="#7D4E24" cx="41.086" cy="57.91" rx="4.753" ry="5.521"/>
      </g>
    </symbol>

    <symbol id="svg-djur">
      <path fill="#397035" d="M88.503,52.76c-0.385-0.664-1.205-0.938-1.91-0.634c-9.552,4.093-14.852,8.935-17.744,12.664
        c0.831-10.439,3.816-31.418,14.51-45.676c0.397-0.53,0.404-1.258,0.018-1.796c-0.389-0.538-1.081-0.761-1.71-0.551
        c-6.814,2.271-12.455,13.039-16.765,32.002c-0.745,3.278-1.387,6.532-1.932,9.591c-0.192-2.1-0.442-4.32-0.764-6.626
        C60.45,39.155,56.117,21.64,45.441,9.63c-0.529-0.596-1.429-0.68-2.059-0.193c-0.63,0.486-0.777,1.378-0.335,2.041
        c6.117,9.176,9.415,30.212,11.029,44.714c-0.932-2.498-2.04-5.207-3.346-8.038C45.46,36.736,35.825,21.17,19.847,11.85
        c-0.694-0.404-1.583-0.198-2.027,0.471c-0.444,0.669-0.289,1.569,0.354,2.051c15.32,11.489,23.938,28.391,28.47,40.546
        c1.878,5.037,3.23,9.701,4.185,13.552c-1.44-2.365-3.21-4.994-5.328-7.69c-9.313-11.854-20.979-19.243-33.735-21.369
        c-0.755-0.123-1.489,0.333-1.705,1.069c-0.216,0.736,0.152,1.518,0.858,1.82C28.75,49.942,39.213,62.26,44.85,71.246
        c6.131,9.774,8.053,17.85,8.071,17.929c0.158,0.688,0.771,1.175,1.478,1.175h10.09c0.837,0,1.516-0.679,1.516-1.517
        c0-0.175,0.949-18.241,22.097-34.102C88.714,54.271,88.887,53.425,88.503,52.76z"/>
    </symbol>

    <symbol id="svg-sten">
      <polygon fill="#878787" points="72.655,39.613 73.414,27.761 73.111,27.542 73.462,22.084 63.654,14.998 53.588,20.281 
        47.069,16.158 37.864,21.748 37.771,33.1 36.341,34.609 37.07,37.635 39.601,34.416 48.316,36.885 48.34,33.962 57.546,28.371 
        60.23,23.48 65.519,23.53 68.121,28.471 65.437,33.362 66.658,34.134 66.599,41.332 71.839,47.058 70.574,51.963 73.177,56.903 
        70.492,61.794 65.205,61.745 62.815,61.722 61.479,63.421 62.936,67.371 56.469,77.969 67.709,78.799 80.912,57.738   "/>
      <polygon fill="#B2B2B2" points="63.267,61.147 62.815,61.722 65.205,61.745 70.492,61.794 73.177,56.903 70.574,51.963 
        71.839,47.058 66.599,41.332 66.658,34.134 65.437,33.362 68.121,28.471 65.519,23.53 60.23,23.48 57.546,28.371 48.34,33.962 
        48.316,36.885 57.871,39.592   "/>
      <path fill="#9D9D9C" d="M61.479,63.421l1.336-1.699l0.451-0.574l-5.396-21.556l-9.555-2.707l-8.716-2.469l-2.53,3.219l-7.703,9.798
        l-8.416,3.026l-0.067,0.339l-3.874,1.392l-2.16,10.95l6.472,7.312l-1.028,7.094l6.445,6.451l7.882-3.464l1.444,0.802l2.558-2.159
        l0.327,0.892l15.049,1.95l2.468-4.049l6.467-10.598L61.479,63.421z M32.26,70.851l-6.444-6.45l-4.137-0.862l-1.445-4.724
        l2.691-3.862l4.136,0.862l0.193-1.33l4.998-2.197l2.496-6.455l3.75-0.404l2.69-3.863l4.137,0.863l0.06,0.198l0.774-0.83l3.988,1.57
        l0.115,0.659l2.055-0.514l2.8,3.75l-1.312,4.781l-4.109,1.028l-1.399-1.873l-0.218,0.233l0.136,0.445l-1.969,2.827l1.25,2.132
        l-2.496,6.456l-3.749,0.403l-0.651,0.549l-0.456,3.144L32.26,70.851z"/>
      <polygon fill="#B2B2B2" points="40.143,67.387 40.599,64.243 41.25,63.694 44.999,63.291 47.495,56.835 46.245,54.703 
        48.214,51.876 48.078,51.431 47.877,51.646 43.889,50.074 43.029,45.15 45.384,42.625 45.324,42.428 41.188,41.565 38.497,45.428 
        34.748,45.833 32.252,52.287 27.254,54.484 27.062,55.814 22.925,54.952 20.234,58.814 21.679,63.538 25.816,64.4 32.26,70.851  
        "/>
      <polygon fill="#C6C6C6" points="43.889,50.074 47.877,51.646 48.078,51.431 48.296,51.197 49.695,53.07 53.805,52.042 
        55.116,47.261 52.316,43.51 50.262,44.024 50.146,43.365 46.158,41.795 45.384,42.625 43.029,45.15   "/>
      <polygon fill="#9D9D9C" points="83.463,74.059 79.113,72.93 77.779,74.683 77.313,74.238 73.264,75.614 72.698,80.323 
        76.183,83.654 80.234,82.279 80.31,81.649 82.484,82.213 85.149,78.702  "/>
      <polygon fill="#9D9D9C" points="54.542,81.901 52.721,85.289 54.542,88.678 58.188,88.678 60.009,85.289 58.188,81.901   "/>
    </symbol>
      <symbol id="edit_btn" >
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <polygon class="st4" points="12.5,2.8 1.9,21.1 23.1,21.1 "/>
      <text transform="matrix(1 0 0 1 6.9375 18.5)" class="st7 st8 st9">EDIT</text>
      </symbol>
      <symbol id="nr_btn" style="transform: translateX(120px);">
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <circle class="st4" cx="12.5" cy="12.5" r="8.1"/>
      <text transform="matrix(1 0 0 1 9.127 16.3157)" class="st6 st7 st8 st10">§</text>
      </symbol>
  </defs>
    <g id="boardgame"></g>
    <g id="grid" v-bind:style="{pointerEvents: ['edit','road','building','number','move','hand'].indexOf(selected.tool) != -1 ? 'none' : 'auto'}">
      <polygon v-for="d in mesh" v-bind:points="toTrianglePoints(d)" class="triangle" 
        v-on:mousedown="_gridTrianlgeMouseDown(d)"
        v-on:mouseover="_gridTrianlgeMouseOver(d)"
        v-on:mouseup="_gridTrianlgeMouseUp(d)"></polygon>
    </g>
    <g id="griddots" v-bind:style="{display: griddotsDisplay, pointerEvents: ['road','building','move'].indexOf(selected.tool) != -1 ? 'auto' : 'none'}">
      <circle class="dot" v-for="d in dotmesh" v-bind:cx="d._pos.toX()" v-bind:cy="d._pos.toY()" r="0" ></circle>
    </g>
    


    <g id="menu">
      <g id="new_btn" v-on:click="newfieldIsOpen = !newfieldIsOpen" >
        <title>Create New Field</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <polygon class="st4" points="12.5,2.8 1.9,21.1 23.1,21.1 "/>
      <text transform="matrix(1 0 0 1 8.0625 18.5)" class="st5 st6 st7 st11">+</text>
        <g id="new_fields_group" v-if="newfieldIsOpen">
          <g v-for="d in fieldTools" v-on:click="selectTool(0, d); currentpiece.createField(d);" v-bind:style="{opacity: newfieldIsOpen, transform: newfieldIsOpen ? 'translateY('+ (24 * fieldTools.indexOf(d) + 25) +'px)' : ''}">
            <path v-bind:fill="d.color" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
            <svg width="25px" height="25px" viewBox="0 0 100 100"><use v-bind:xlink:href="'#svg-' + d.type"></use></svg>
          </g>






        </g>
      </g>
      <g id="edit_btn" onClick="selectTool(1)" style="transform: translateX(30px);">
        <title>Edit Field</title>
        <use xlink:href="#edit_btn"></use>
      </g>
      <g id="road_btn" onClick="selectTool(2)" style="transform: translateX(60px);">
        <title>Create/Edit Road</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <path class="st4" x="30" d="M17.5,5C16.1,5,15,6.1,15,7.5c0,0.3,0.1,0.6,0.2,0.9l-6.8,6.8C8.1,15.1,7.8,15,7.5,15C6.1,15,5,16.1,5,17.5
        C5,18.9,6.1,20,7.5,20c1.4,0,2.5-1.1,2.5-2.5c0-0.3-0.1-0.6-0.2-0.9l6.8-6.8c0.3,0.1,0.6,0.2,0.9,0.2c1.4,0,2.5-1.1,2.5-2.5
        S18.9,5,17.5,5z"/>
      </g>
      <g id="building_btn" onClick="selectTool(3)" style="transform: translateX(90px);">
        <title>Create/Edit Building-site</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <polygon class="st4" points="17.5,3.8 7.5,3.8 2.5,12.5 7.5,21.2 17.5,21.2 22.5,12.5 "/>
      </g>
      <g id="nr_btn" onClick="selectTool(4)" style="transform: translateX(120px);">
        <title>Add numberplate</title>
        <use xlink:href="#nr_btn"></use>
      </g>
      <g id="move_btn" onClick="selectTool(5)" style="transform: translateX(200px);">
        <title>Move/Rotate</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <circle class="st4" cx="12.5" cy="12.5" r="8.1"/>
      <polygon class="st7" points="18.5,12.5 16.2,10.2 16.2,11.5 13.5,11.5 13.5,8.8 14.8,8.8 12.5,6.5 10.2,8.8 11.5,8.8 11.5,11.5 
  8.8,11.5 8.8,10.2 6.5,12.5 8.8,14.8 8.8,13.5 11.5,13.5 11.5,16.2 10.2,16.2 12.5,18.5 14.8,16.2 13.5,16.2 13.5,13.5 16.2,13.5 
  16.2,14.8 "/>
      </g>
      <g id="hand_btn" onClick="selectTool(6)" style="transform: translateX(230px);">
        <title>Choose what to move</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
      <circle class="st4" cx="12.5" cy="12.5" r="8.1"/>
      <path class="st7" d="M12.3,7.2c0.1,0,0.3,0,0.4,0c0,0,0,0,0.1,0c0.3,0,0.5,0.1,0.8,0.3c0.1,0,0.1,0,0.2,0C14.5,7.1,15.4,7.3,16,8
      c0,0.1,0.1,0.1,0.2,0.1c0.2,0,0.5,0,0.7,0c0.8,0.2,1.4,0.9,1.4,1.8c0,0.6,0,1.3,0,1.9c0,0.2,0,0.5-0.1,0.7
      c-0.2,0.9-0.4,1.8-0.7,2.6c-0.1,0.4-0.2,0.8-0.2,1.2c0,0.9-0.6,1.5-1.5,1.5c-1.6,0-3.2,0-4.8,0c-0.1,0-0.3,0-0.4-0.1
      c-0.6-0.2-1-0.7-1-1.3c0-0.1,0-0.2-0.1-0.2c-0.7-0.7-1.5-1.4-2.2-2.1c-0.4-0.3-0.6-0.7-0.6-1.2c0-0.6,0-1.3,0-1.9
      c0-0.8,0.7-1.5,1.5-1.7c0.1,0,0.3,0,0.4,0c0.1-1.2,1.3-2,2.5-1.6c0,0,0.1,0,0.1,0c0.2-0.2,0.5-0.3,0.8-0.4
      C12.1,7.2,12.2,7.2,12.3,7.2z M15.4,10.1c0,0,0-0.1,0-0.1c0-0.3,0-0.6,0-0.8c0-0.5-0.4-0.9-0.9-0.9c-0.5,0-0.9,0.4-0.8,0.9
      c0,0.1,0,0.2,0,0.3c0,0.2,0,0.4,0,0.6c-0.1,0-0.2,0-0.2,0c0-0.1,0-0.1,0-0.2c0-0.3,0-0.6,0-0.9c0-0.5-0.5-0.9-1-0.9
      c-0.5,0-0.9,0.4-0.9,0.9c0,0.3,0,0.6,0,0.9c0,0.1,0,0.1,0,0.2c-0.1,0-0.2,0-0.2,0c0-0.3,0-0.5,0-0.8c0-0.4-0.3-0.7-0.7-0.8
      c-0.6-0.1-1,0.3-1,0.9c0,1,0,2,0,3c0,0,0,0.1,0,0.2c-0.1-0.1-0.3-0.2-0.2-0.4c0-0.3,0-0.6,0-0.9c0-0.1,0-0.3,0-0.4
      c-0.1-0.4-0.5-0.7-0.9-0.7c-0.5,0-0.8,0.4-0.8,0.8c0,0.5,0,1.1,0,1.6c0,0.3,0.1,0.6,0.3,0.8c0.7,0.7,1.5,1.4,2.2,2.1
      c0.2,0.2,0.4,0.5,0.4,0.8c0,0.3,0.2,0.5,0.5,0.5c1.6,0,3.2,0,4.7,0c0.3,0,0.5-0.2,0.5-0.5c0-0.2,0-0.4,0-0.6
      c0.2-0.8,0.4-1.6,0.6-2.4c0.1-0.4,0.3-0.9,0.3-1.3c0.1-0.7,0-1.5,0-2.2c0-0.5-0.4-0.8-0.9-0.8c-0.4,0-0.8,0.4-0.8,0.9
      c0,0.1,0,0.1,0,0.2C15.6,10.1,15.5,10.1,15.4,10.1z"/>
      </g>
      <g id="save_btn" onClick="saveBoard()" style="transform: translateX(450px);">
        <title>Save component</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h42c1.7,0,3,1.3,3,3v19C48,23.7,46.7,25,45,25z"/>
      <text transform="matrix(1 0 0 1 9.127 16.3157)" fill="#000" class="st8 st10">Save</text>
      </g>
      <g id="new_bp_btn" onClick="newBp()" style="transform: translateX(510px);">
        <title>New component</title>
        <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h42c1.7,0,3,1.3,3,3v19C48,23.7,46.7,25,45,25z"/>
      <text transform="matrix(1 0 0 1 9.127 16.3157)" fill="#000" class="st8 st10">New</text>
      </g>  
    </g>

  
</svg>
  <h1>Instruktioner:</h1>
  <ol>
    <li><p>Varje gång en fältpensel väljs skapas ett nytt "fält", med unika egenskaper. Måla därför hela fältet på en gång. Vill du senare ändra på fältet använder du <svg height="15" width="15" viewBox="0 0 25 25"><use xlink:href="#edit_btn"></use></svg> edit-verktyget och väljer vilket fält du vill ändra. Till hjälp har du fälten uppradade nedan.</p></li>
    <li><p>Det finns inget 'ångra' eller <tt>[cmd-z]</tt>. Håll ner <tt>[alt]</tt>-tangenten för att radera objekt för respektive verktyg.</p></li>
    <li><p>Placera ALLTID ut byggnadsplatser sist, då tillhörande fält bestäms vid tillfället du placerar ut dem.</p></li>
    <li><p>För skalaenlighet rekommenderas vägarna ha en längd på 4-6.</p></li>
    <li><p>Innan brickan går att spara behöver alla fält ha en nummerbricka. Använd <svg height="15" width="15" viewBox="0 0 25 25"><use xlink:href="#nr_btn"></use></svg> nummer-verktyget.</p></li>
    <li><p>Spara brickan genom att kopiera datan längst ner på sidan i ett textdokument. <strong>OBS! All data förloras om du uppdaterar sidan!</strong></p></li>
  </ol>
  <h1>Fält:</h1>
  <div id="list"></div>
  <h1>Byggplatser:</h1>
  <div id="sites"></div>
  <h1>Data:</h1>
  <p>Kopiera datan i fältet nedan och spara i ett textdokument.</p>
 
  <div id="saved" style="display: inline-block;"></div>
  <h1>Spelplaner:</h1>
  <div id="boardgames" style="display: inline-block;"></div>

  </div>

  <!--script type="text/javascript">

    /*****************************
        DEFENITIONER
    ******************************/

    // var gridbehind = document.getElementById('gridbehind');
    // var gridforground = document.getElementById('gridforground');
    // var grid = document.getElementById('grid');
    // var griddots = document.getElementById('griddots');
    // var fieldsDOM = document.getElementById('fields');
    // var roadsDOM = document.getElementById('roads');
    // var buildingsDOM = document.getElementById('buildings');


    //   var distX = 20.0;
    //   var distY = Math.pow( Math.pow(distX,2) - Math.pow(distX/2,2) , 0.5);
    //   var marginX = distX/2;
    //   var marginY = 30;
    //   var canvasHeight = 498;
    //   var canvasWidth = 600;
    // var antalPunkterXled = (canvasWidth-marginX)/(distX/2);
    // var mesh = [];
    // var translate = { _x:0, _y:0 };
    // var rotation = { origin: {_x:0, _y:0}, angle:0, tr_conv: {
    //   nf: [[-1,-1],[0,-1],[0,0],[-1,0],[-2,0],[-2,-1]], 
    //   f: [[-1,0],[-2,0],[-2,-1],[-1,-1],[0,-1],[0,0]]} 
    // };


    //   var selected = {tool:''};

    // var currentpiece = {}
    // var boardgames = []
    // var boardpieces = []


    // var fieldTools = [
    //       {name:'trä', tool: 'field', type: 'trä', color: '#1abc9c'}, 
    //       {name:'sten', tool: 'field', type: 'sten', color: 'lightgray'}, 
    //       {name:'olja', tool: 'field', type: 'olja', color: '#B697D8'}, 
    //       {name:'säd', tool: 'field', type: 'säd', color: '#f1c40f'}, 
    //     {name:'djur', tool: 'field', type: 'djur', color: '#75B96B'}
    //   ]

    // var tools = [
    //     {name:'new', tool: 'new', fieldTools: fieldTools}, 
    //       {name:'edit', tool: 'edit'}, 
    //       {name:'road', tool: 'road'}, 
    //       {name:'building', tool: 'building'}, 
    //     {name:'number', tool: 'number'},
    //     {name:'move', tool: 'move', translate: {_x: 0, _y: 0}},
    //     {name:'hand', tool: 'hand'}
    //   ]

    // var boardgameClass = function(){
    //   this.id = c4()+'_'+c4()+'_'+c4();
    //   this.bps = []
    // }

    var updateFrame = function(){
        var mainGroup = d3.select('g#boardgame').selectAll('g.boardpiece')
          .data(boardpieces)
          .attr('id', function(d){return d.id})
          .html(function(d){return '<g id="fields_'+d.id+'"></g><g id="roads_'+d.id+'"></g><g id="buildings_'+d.id+'"></g>'})
          .on('mousedown', function(d){
            if( selected.tool == 'hand' && currentpiece != d ){
              currentpiece = d;
              selectTool(5)
              currentpiece.setStartMotion(d)
            }
          });

        mainGroup.enter().append('g')
          .attr('class', 'boardpiece')
          .attr('id', function(d){return d.id})
          .html(function(d){return '<g id="fields_'+d.id+'"></g><g id="roads_'+d.id+'"></g><g id="buildings_'+d.id+'"></g>'})
          .on('mousedown', function(d){
            if( selected.tool == 'hand' && currentpiece != d ){
              currentpiece = d;
              selectTool(5)
              currentpiece.setStartMotion(d)
            }
          });

        mainGroup.exit().remove();

    }
    var updateAllBoards = function(){
      boardgame.bps.map((bp)=>{
        bp.updateAll()
      })
      boardgame.bps.map((bp)=>{
        bp.updateAll()
      })
    }


    /*****************************
    FÄLT / VÄGAR / BYGG-PLATSER
    ******************************/

    //     var boardpieceClass = function(boardpiece){
    //       var self = this;
    //       var boardpiece = boardpiece || {};
    //       this.id = boardpiece.id || c4()+'-'+c4()+'-'+c4();
    //       this.fields = boardpiece.fields || [];
    //       this.roads = boardpiece.roads || [];
    //       this.buildings = boardpiece.buildings || [];

    //       this.svg = '' || boardpiece.svg;

    //       this.fieldsGroup = null
    //       this.roadsGroup = null
    //       this.buildingsGroup = null


    //       /**********************/
    //       /*       FIELDS       */
    //       /**********************/
     
    //     this.updateFields = function(){

    //       console.log('g#fields_'+self.id)
    //       self.fieldsGroup = d3.select('g#fields_'+self.id).selectAll('g.field')
    //             .data(self.fields)
    //             .html(paintNumberBadge)
    //             .attr('id', function(d){return d.id })
    //             .attr('class', function(d){return 'field '+d.type })
    //             .attr('type', function(d){return d.type })
    //           .on('click', function(d){
    //             if(selected.tool=='edit'){ self.editField(d) }
    //           }); 

    //       self.fieldsGroup.enter().append('g')
    //             .html(paintNumberBadge)
    //             .attr('id', function(d){return d.id })
    //             .attr('class', function(d){return 'field '+d.type })
    //             .attr('type', function(d){return d.type })
    //           .on('click', function(d){
    //             if(selected.tool=='edit'){ self.editField(d) }
    //           });

    //       self.fieldsGroup.exit().remove();

    //       var f = self.fieldsGroup.selectAll('polygon')
    //             .data(function(d){ return d.array})
    //             .attr('points', toTrianglePoints)
    //             .on('click',function(d){
    //               if(selected.tool=='number'){
    //                 self.setFieldNumber(d, fields)
    //               }
    //             });

    //         f.enter().insert('polygon',':first-child')
    //             .attr('points', toTrianglePoints)
    //             .on('click',function(d){
    //               if(selected.tool=='number'){
    //                 self.setFieldNumber(d, fields)
    //               }
    //             });

    //         f.exit().remove();


    //       var list = d3.select('#list').selectAll('p')
    //           .data(self.fields)
    //           .text(function(d) {return d.type+' '+d.array.length})

    //         list.enter().append('p')
    //           .text(function(d) {return d.type+' '+d.array.length})

    //         list.exit().remove()

    //     }

    //     // FUNCITONS

    //       this.editField = function(d){
    //       self.current_field = self.fields[self.fields.indexOf(d)]
    //       selectTool(0, tools[0].fieldTools.find(function(t){return t.type == d.type;}))
    //       }

    //     this.createField = function(d){
    //       selected = d;
    //       // Remove empty fields
    //       self.fields = self.fields.filter(function(a){return a.array[0] != undefined })
    //       self.current_field = {
    //         id: c4()+'-'+c4(),
    //         type: d.type,
    //         array: []
    //       };
    //       self.fields.push(self.current_field)
    //     }

    //     this.addField = function(d, type, color){
    //       if(self.current_field.array.find((t)=>{return t.index==d.index}) == undefined ){
    //         self.current_field.array.push({
    //           refid: self.current_field.id,
    //             index: d.index,
    //             _pos: new _position( d._pos._x, d._pos._y ),
    //             flip: d.flip,
    //             fill: color,
    //             type: type
    //           })
    //       } 
    //     }

    //     this.setFieldNumber = function(d){
    //       var l = self.fields.find((f)=>{return f.id == d.refid})
    //       l.number = {_pos: d._pos, nr: '?'};
    //       self.updateFields()
    //     }

    //     this.removeField = function(d){ // When ALT-pressed
    //       if(self.current_field.array.find((f)=>{return f.index==d.index}) != undefined ){
    //         self.current_field.array.splice(
    //           self.current_field.array.indexOf(
    //             self.current_field.array.find(function(f){
    //               return f.index==d.index
    //             })
    //           )
    //         ,1)
    //       }
    //     }



    //       /**********************/
    //       /*        ROADS       */
    //       /**********************/

    //       this.prelRoad = []
        
    //     this.updateRoads = function(){

    //       var data = self.prelRoad[0] ? self.roads.concat([self.prelRoad]) : self.roads ;

    //       self.roadsGroup = d3.select('#roads_'+self.id).selectAll('g.road')
    //         .data(data)
    //         .html(paintRoads);

    //       self.roadsGroup.enter().append('g')
    //         .attr('class', 'road')
    //         .html(paintRoads)
    //         .on('click', function(d){ 
    //           if( selected.tool == "road" && altPress ){ self.removeRoad(d) }
    //         }); 

    //       self.roadsGroup.exit().remove();
    //     }

    //     // FUNCTIONS

    // /**/    this.setRoadStart = function(d){
    //       altPress ? 'pass' : self.prelRoad=[ new _position(d._pos._x, d._pos._y), new _position(d._pos._x, d._pos._y)] ;
    //       self.updateRoads();
    //     }

    // /**/  this.setRoadEnd = function(d){
    //       if(!altPress){ 
    //         self.prelRoad[1]._x = d._pos._x; 
    //         self.prelRoad[1]._y = d._pos._y;
    //       }
    //       self.updateRoads();
    //     }

    // /**/  this.saveRoad = function(d, roads){
    //       self.roads.push(self.prelRoad)
    //       self.prelRoad=[]
    //       self.updateRoads();
    //     }

    //       this.removeRoad = function(d){ // When ALT-pressed
    //       var arr = self.roads.map(function(f){return ''+f[0]._x+f[0]._y+f[1]._x+f[1]._y==''+d[0]._x+d[0]._y+d[1]._x+d[1]._y ; });
    //       var index = arr.indexOf(true)
    //       self.roads.splice( index,1) 
    //       self.updateRoads();
    //     }


    //       /**********************/
    //       /*      BUILDINGS     */
    //       /**********************/
        
    //     this.updateBuildings = function(){

    //       self.buildingsGroup = d3.select('g#buildings_'+self.id).selectAll('g.building')
    //           .data(self.buildings)
    //           .attr('id', function(d){return d.id })
    //           .html(paintBuildings);

    //       self.buildingsGroup.enter().append('g')
    //           .attr('class', 'building')
    //           .attr('id', function(d){return d.id })
    //           .html(paintBuildings)
    //         .on('click', function(d){ /**** DELETE BUILDINGSITE ****/
    //           if(selected.tool=='building' && altPress ){
    //             self.removeBuilding(d);
    //           }
    //         });

    //       self.buildingsGroup.exit().remove();


    //       var sites = d3.select('#sites').selectAll('p')
    //           .data(buildings)
    //           .text(function(d) {return 'Byggplats: '+d.fields.map((f)=>{return f.type}).join(' ')})
          
    //         sites.enter().append('p')
    //           .text(function(d) {return 'Byggplats: '+d.fields.map((f)=>{return f.type}).join(' ')})

    //         sites.exit().remove()

    //     }

    //     // FUNCTIONS

    // /**/  this.setBuilding = function(d){
    //       var arr = [ 
    //         new _position(d._pos._x-2, d._pos._y), new _position(d._pos._x-1, d._pos._y), new _position(d._pos._x,d._pos._y), 
    //         new _position(d._pos._x-2, d._pos._y-1), new _position(d._pos._x-1,d._pos._y-1), new _position(d._pos._x, d._pos._y-1)
    //       ]
    //       var a = arr.map((ai,i)=>{
    //         var match = self.fields.map((fie)=>{return fie.array.find((f)=>{ return ai._x+'-'+ai._y == f.index }) }).filter((v)=>{return v})[0] 
    //         return match ? {index: ai._x+'-'+ai._y, _pos: ai, flip: i%2==1, refid: match.refid, type: match.type} : {index: ai._x+'-'+ai._y, _pos: ai, flip: i%2==1};
    //       })
    //       var b = {
    //         id: c4()+'-'+c4(),
    //         array: a,
    //         fields: a.map(function(a){return a.refid ? {refid: a.refid, type: a.type} : {refid: c4(), type: 'empty'};}).unique()
    //       }
    //       self.buildings.push(b)
    //       self.updateBuildings()
    //     }

    //     this.removeBuilding = function(d){
    //       self.buildings.splice(self.buildings.map((b)=>{return b.id==d.id;}).indexOf(true),1)
    //       self.updateBuildings()
    //     }


    //     /* Motion */

    // /**/  this.setStartMotion = function(d){
    //       if(selected.tool == 'move'){
    //         translate = { _x: 0, _y: 0 };
    //         selected._pos = d._pos;
    //         selected.flip = d.flip;
    //         rotation.origin = d.flip ? {_x: d._pos._x+1, _y: d._pos._y}: d._pos; 
    //         rotation.angle = 0;
    //       }
    //     }

    //     this.moveContent = function(d){
    //       if(mdown && selected.tool == 'move' && d.flip == selected.flip){
    //         if(altPress){ 
    //           rotation.angle = ( d._pos._y-(rotation.origin._y+translate._y) ) * Math.PI*2/6 ;
    //         }else{
    //           translate = { _x: d._pos._x-selected._pos._x, _y: d._pos._y-selected._pos._y };
    //         }
    //         self.updateAll()
    //       }
    //     }

    //     this.translateMotion = function(d){
    //       if(selected.tool == 'move' && (translate._x || translate._y || rotation.angle) ){
    //         self.fields = self.fields.map((field)=>{ return transformField( field, translate._x, translate._y )})
    //         self.roads = self.roads.map((road)=>{ return transformRoad( road, translate._x, translate._y )});
    //         self.buildings = self.buildings.map((building)=>{return transformBuilding( building, translate._x, translate._y )})
    //         self.resetTransform()
    //         self.updateAll()
    //       }
    //     }

    //     this.resetTransform = function(){
    //       translate = { _x: 0, _y: 0 };
    //       rotation.origin = { _x: 0, _y: 0 };
    //       rotation.angle = 0;
    //     }

    //     this.save = function(){
    //       var max_x = Math.max(...self.fields.map((field)=>{return Math.max(...field.array.map((d)=>{return d._pos._x}))}))
    //       var max_y = Math.max(...self.fields.map((field)=>{return Math.max(...field.array.map((d)=>{return d._pos._y}))}))
    //       var min_x = Math.min(...self.fields.map((field)=>{return Math.min(...field.array.map((d)=>{return d._pos._x}))}))
    //       var min_y = Math.min(...self.fields.map((field)=>{return Math.min(...field.array.map((d)=>{return d._pos._y}))}))

    //       // // TRANSFORM
    //       // var new_fields = JSON.parse(JSON.stringify(self.fields));
    //       //  new_fields = new_fields.map((field)=>{ return transformField( field, -min_x, -min_y )})
    //       // var new_roads = JSON.parse(JSON.stringify(self.roads));
    //       //  new_roads = new_roads.map((road)=>{ return transformRoad( road, -min_x, -min_y )});
    //       // var new_buildings = JSON.parse(JSON.stringify(self.buildings));
    //       //  new_buildings = new_buildings.map((building)=>{ return transformBuilding( building, -min_x, -min_y )})

    //       var temp = JSON.parse(JSON.stringify(translate));
    //       translate = {_x: -min_x, _y: -min_y}
    //       self.updateAll()
    //       var svgxml = document.getElementById(self.id).innerHTML;
    //       self.svg = '<svg width="'+((max_x-min_x+2)*distX/2+marginX*2)+'" height="'+((max_y-min_y+1)*distY+marginY*2)+'">'+svgxml+'</svg>';
    //       translate = temp;
    //       self.updateAll()

    //       if(boardpieces.find((b)=>{ return b.id == self.id }) != undefined){
    //         boardpieces = boardpieces.map((b)=>{ return b.id == self.id ? new boardpieceClass(currentpiece) : b ;})
    //       }else{
    //         boardpieces.push(new boardpieceClass(currentpiece));
    //         updateFrame()
    //       }
    //       paintBoardPieces()
    //       updateAllBoards()
    //     }


    //       this.updateAll = function(){
    //         self.updateFields()
    //         self.updateRoads()
    //         self.updateBuildings()
    //       }


        
    //     }// END OF boardpieceClass()


     /*****************************
      GLOBAL PAINT FUNCTIONS
     ******************************/

    // var toTrianglePoints = function(d){
    //   return [
    //     [d._pos.toX(0,d.flip),    d._pos.toY(0, d.flip)],
    //     [d._pos.toX(2,d.flip),    d._pos.toY(2, d.flip)],
    //     [d._pos.toX(1,!d.flip),   d._pos.toY(1, !d.flip)]
    //   ].map(function(p){return p.join(',')}).join(' '); 
    // }

      var paintNumberBadge = function(field){
      if(field.number){
        return '<g class="number"><circle cx="'+field.number._pos.toX(1,0)+'" cy="'+field.number._pos.toY(0,0.5)+'" r="8.1"/><text id="nr-'+field.id+'" transform="matrix(1 0 0 1 '+field.number._pos.toX(1,0)+' '+(field.number._pos.toY(0,0.5)+5)+')" >'+field.number.nr+'</text></g>' ;
      }else{
        return '';
      }
      }

    var paintRoads = function(d){
      var caps = '<circle cx="'+d[0].toX()+'" cy="'+d[0].toY()+'" r="2" /> <circle cx="'+d[1].toX()+'" cy="'+d[1].toY()+'" r="2" />';
        var line = '<line x1="'+d[0].toX()+'" y1="'+d[0].toY()+'" x2="'+d[1].toX()+'" y2="'+d[1].toY()+'" />';
        return caps+line;
      }

    var paintBuildings = function(d){
        return '<title>'+d.fields.map((f)=>{return f.type}).join(' ')+'</title>'+d.array.map((f)=>{return '<polygon points="'+toTrianglePoints(f)+'"/>'}).join();
      }

      var paintBoardPieces = function() {
      var saved = document.getElementById('saved')

        var savedGroup = d3.select('#saved').selectAll('div.savedBP')
            .data(boardpieces)
            .attr('id', function(d){return d.id})
            .html(function(d){return d.svg+'<div><p>JSON:</p><textarea cols="40" rows="5">'+JSON.stringify(d)+'</textarea></div><div style="float: right; margin-top: 30px;"><button onClick="addBpToGameBoard(\''+d.id+'\')">Lägg till</button><button onClick="editBp(\''+d.id+'\')">Edit</button></div>' });

          savedGroup.enter().append('div')
            .attr('class', 'savedBP')
            .attr('id', function(d){return d.id})
            .html(function(d){return d.svg+'<div><p>JSON:</p><textarea cols="40" rows="5">'+JSON.stringify(d)+'</textarea></div><div style="float: right; margin-top: 30px;"><button onClick="addBpToGameBoard(\''+d.id+'\')">Lägg till</button><button onClick="editBp(\''+d.id+'\')">Edit</button></div>' });

          savedGroup.exit().remove();
    }

    var paintBoardGames = function() {
      var games = document.getElementById('games')

        var gamesGroup = d3.select('#boardgames').selectAll('div.game')
            .data(boardgames)
            .attr('id', function(d){return d.id})
            .html(function(d){return d.svg+'<div><p>JSON:</p><textarea cols="40" rows="5">'+JSON.stringify(d)+'</textarea></div><div style="float: right; margin-top: 30px;"><button onClick="addBpToGameBoard(\''+d.id+'\')">Lägg till</button><button onClick="editBp(\''+d.id+'\')">Edit</button></div>' });

          gamesGroup.enter().append('div')
            .attr('class', 'savedBP')
            .attr('id', function(d){return d.id})
            .html(function(d){return d.svg+'<div><p>JSON:</p><textarea cols="40" rows="5">'+JSON.stringify(d)+'</textarea></div><div style="float: right; margin-top: 30px;"><button onClick="addBpToGameBoard(\''+d.id+'\')">Lägg till</button><button onClick="editBp(\''+d.id+'\')">Edit</button></div>' });

          gamesGroup.exit().remove();
    }

    var addBpToGameBoard = function(id){
      currentpiece = boardpieces.find((d)=>{ return d.id==id});
      if( boardgame.bps.find((d)=>{ return d.id==id}) != undefined && confirm('Brickan verkar redan finnas på arbetsytan. Lägger du till den kommer den gamla bli översparad.')){
        boardgame.bps = boardgame.bps.map((b)=>{return b.id == id ? currentpiece : b ; })
        updateAllBoards()
      }else{
        boardgame.bps.push(currentpiece);
        updateAllBoards()
      }
    }

    var editBp = function(id){
      if(boardgame.bps.length && confirm('Är du säker? Osparade brickor i arbetsfältet kommer raderas.')){
        currentpiece = boardpieces.find((d)=>{ return d.id==id});
        boardgame.bps = [currentpiece];
        updateFrame()
        updateAllBoards()

      }
    }

    var newBp = function(id){
      if(boardgame.bps.length && confirm('Är du säker? Osparade brickor i arbetsfältet kommer raderas.')){
        boardgame.bps[0] = currentpiece = new boardpieceClass();
        boardpieces.push(currentpiece)
        updateFrame()
      }
    }

    var c4 = function(){ // Random id generator
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    }

    // var boardgame = new boardgameClass();
    // boardgame.bps[0] = boardpieces[0] = currentpiece = new boardpieceClass();
    // updateFrame()
    // updateAllBoards()
    

    /* Transform */

    var transformField = function( field, transformX, transformY){
      var i = (Math.round(rotation.angle*3/Math.PI)%6+6)%6; // i = 0 to 5 according to angle (both positive and negative).
      var f = i%2; // = true when transformed needs to be fliped.
      field.array = field.array.map((d)=>{
        var tr = d.flip ? rotation.tr_conv.f[i] : rotation.tr_conv.nf[i] ;
        d._pos._x = d._pos.x_ny+tr[0];
        d._pos._y = d._pos.y_ny+tr[1];
        d.index = d._pos.x_ny+'-'+d._pos.y_ny;
        d.flip = f ? !d.flip : d.flip ;
        return d
      });
      return field
    }

    var transformRoad = function( road, transformX, transformY ){
      road = road.map((d)=>{
        d._x = d.x_ny
        d._y = d.y_ny
        return d
      });
      return road
    }
    
    var transformBuilding = function( building, transformX, transformY ){
      var i = (Math.round(rotation.angle*3/Math.PI)%6+6)%6; // i = 0 to 5 according to angle (both positive and negative).
      var f = i%2; // = true when transformed needs to be fliped.
      building.array = building.array.map((d)=>{
        var tr = d.flip ? rotation.tr_conv.f[i] : rotation.tr_conv.nf[i] ;
        d._pos._x = d._pos.x_ny+tr[0];
        d._pos._y = d._pos.y_ny+tr[1];
        d.index = d._pos.x_ny+'-'+d._pos.y_ny;
        d.flip = f ? !d.flip : d.flip ;
        return d
      });
      return building
    }

    var saveBoard = function(){
      boardgame.bps.length > 1 ? saveBoardGame() : currentpiece.save() ;
    }

    var saveBoardGame = function() {
      var svgxml = document.getElementById('boardgame').innerHTML;
      boardgame.svg = '<svg width="'+canvasWidth+'" height="'+canvasHeight+'">'+svgxml+'</svg>';
      boardgames.push(boardgame)
      boardgame = new boardgameClass();
      paintBoardGames()
    }

     /*****************************
            MESH
     ******************************/

    // Create Mesh

    // var _position = function(_x,_y) {
    //   this._x = _x; 
    //   this._y = _y;
    //   this.x_ny = 0;
    //   this.y_ny = 0;
    
    //   this.toX = function(shift_x = 0, shift_y = 0){
    //     return this.rotateX(shift_x, shift_y) * distX/2 + marginX ;
    //   }
    //   this.toY = function(shift_x = 0, shift_y = 0){
    //     return this.rotateY(shift_x, shift_y) * distY + marginY ;
    //   }
    //   this.rotateX = function(shift_x = 0, shift_y = 0){
    //     var self = this;

    //     if(altPress && selected.tool == 'move'){ 
    //       var x = (self._x + shift_x - rotation.origin._x)/2;
    //       var y = (self._y + shift_y - rotation.origin._y)* distY/distX;
    //       var x_ny = x * Math.cos(rotation.angle) - y * Math.sin(rotation.angle) ;
    //       self.x_ny = Math.round((x_ny * 2) + rotation.origin._x + translate._x);
    //       return Math.round((x_ny * 2) + rotation.origin._x + translate._x);
    //     }else{
    //       self.x_ny = self._x + shift_x + translate._x;
    //       return self._x + shift_x + translate._x;
    //     }
    //   }
    //   this.rotateY = function(shift_x = 0, shift_y = 0){
    //     var self = this;
    //     if(altPress && selected.tool == 'move'){ 
    //       var x = (self._x + shift_x - rotation.origin._x)/2;
    //       var y = (self._y + shift_y - rotation.origin._y)* distY/distX;
    //       var y_ny = x * Math.sin(rotation.angle) + y * Math.cos(rotation.angle) ;
    //       self.y_ny = Math.round((y_ny * distX/distY) + rotation.origin._y + translate._y) ;
    //       return Math.round((y_ny * distX/distY) + rotation.origin._y + translate._y) ;
    //     }else{
    //       self.y_ny = self._y + shift_y  + translate._y
    //       return self._y + shift_y  + translate._y;
    //     }
    //   }
    // }

    // var index = 0;
    // var _pos = new _position(0,0);
    // for (var y = marginY; y < canvasHeight; y+= distY) {
    //   _pos._x = 0;
    //   for (var x = marginX; x < canvasWidth; x+= distX/2) {
    //     var flip = !flip;
    //     mesh.push({
    //       index: _pos._x+'-'+_pos._y, 
    //       _pos: new _position(_pos._x,_pos._y),
    //       flip: flip
    //       })
    //     index++;
    //     _pos._x++;
    //   }
    //   _pos._y++;
    // }


     /*****************************
           GRID
    ******************************/

    // Paint grid

    // var canvas = d3.select('#canvas')
    //   .attr('height', canvasHeight)
    //   .attr('width', canvasWidth);


    // var triangles = d3.select('g#grid').selectAll('polygon')
    //   .data(mesh).enter().append('polygon')
    //     .attr('points', function(d){return toTrianglePoints(d)})
    //     .attr('class', 'triangle')
    //     .on('mousedown', function(d){
    //       console.log('mousedown')
    //       mdown = true;
    //       if(selected.tool == 'field'){ 
    //         altPress ? 
    //           currentpiece.removeField(d) : 
    //           currentpiece.addField(d, selected.type, selected.color) ;
    //         currentpiece.updateFields()
    //       }
    //     })
    //     .on('mouseover', function(d){
    //       if(mdown && selected.tool != ''){
    //         if(selected.tool == 'field'){ 
    //           altPress ? 
    //             currentpiece.removeField(d) : 
    //             currentpiece.addField(d, selected.type, selected.color) ;
    //           currentpiece.updateFields()
    //         }
    //       }
    //     })
    //     .on('mouseup', function(){
    //       console.log('mouseup')
    //       mdown = false;
    //     });


    // var points = d3.select('#griddots').selectAll('circle.dot')
    //   .data(mesh.filter(function(m){return !m.flip })).enter().append('circle')
    //     .attr('class', 'dot')
    //     .attr('cx', function(d){return d._pos.toX()})
    //     .attr('cy', function(d){return d._pos.toY()})
    //     .attr('r', 0)
    //     .attr('index', function(d){return d._pos._x+'-'+d._pos._y})
    //     .on('mousedown', function(d){
    //       mdown = true;
    //       if(selected.tool=='road'){
    //         currentpiece.setRoadStart(d)
    //       }
    //       if(selected.tool == 'move'){
    //         currentpiece.setStartMotion(d)
    //       }
    //     })
    //     .on('mouseover', function(d){
    //       if(mdown && selected.tool=='road'){
    //         currentpiece.setRoadEnd(d)
    //       }
    //       if(mdown && selected.tool == 'move' && d.flip == selected.flip){
    //         currentpiece.moveContent(d)
    //       }
    //     })
    //     .on('mouseup', function(d){
    //       if(selected.tool=='road'){
    //         currentpiece.setRoadEnd(d)
    //         currentpiece.saveRoad()
    //         currentpiece.updateRoads();
    //       }
    //       if(selected.tool == 'move' && (translate._x || translate._y || rotation.angle) ){
    //         currentpiece.translateMotion(d)
    //       }
    //       mdown = false;
    //     })
    //     .on('click', function(d){
    //       if(selected.tool=='building'){
    //         currentpiece.setBuilding(d)
    //       }
    //     });


/*
     /*****************************
          MENU / TOOLS
     *****************************/


    var printTools = function(fieldtools){
      var t = d3.select('#new_fields_group').selectAll('g')
        .data(fieldtools);
      t.enter().append('g')
        .on('click', function(d){ selectTool(0, d); currentpiece.createField(d)})
        .style('opacity', function(d){ return newfieldIsOpen ? '1' : '0' ;})
        .style('transform', function(d,i){ return newfieldIsOpen ? 'translateY('+(24*i+25)+'px)' : '' })
        .html(function(d){return'<path fill="'+d.color+'" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/><svg width="25px" height="25px" viewBox="0 0 100 100"><use xlink:href="#svg-' + d.type + '"></use></svg>'});
      t.exit().remove()
    }

    var selectTool = function(i,d){
      if(boardgame.bps.length>1 && i<=4){
        alert('Vill du ändra något i nån bricka behöver du söka upp brickan längre ner på sidan och klicka edit.')
        return
      }
      selected = i ? tools[i] : d ;
      console.log('selected tool: '+ selected.tool);
      
      // Move grid to back
      ['edit','road','building','number','move','hand'].indexOf(selected.tool) != -1 ? 
        grid.style.pointerEvents = 'none' : 
        grid.style.pointerEvents = 'auto' ;

      // Show dots
      ['road','building','move'].indexOf(selected.tool) != -1 ? 
        griddots.style.display = '' : 
        griddots.style.display = 'none' ;
      ['road','building','move'].indexOf(selected.tool) != -1 ? 
        griddots.style.pointerEvents = 'auto' : 
        griddots.style.pointerEvents = 'none' ;
    }

    var newfieldIsOpen = false;
    var toggleNewBtn = function(){ 
      newfieldIsOpen = !newfieldIsOpen; 
      newfieldIsOpen ? printTools(tools[0].fieldTools): printTools([]);
    }
*/
    // mdown = false;
    // document.onmousedown = function(){
    //   this.mdown = true;
    // }
    // document.onmouseup = function(){
    //   this.mdown = false;
    // }

    // var altPress = false;
    // document.onkeydown = function(e){ 
    //   if(e.altKey){ 
    //     altPress = true; console.log('Alt press');
    //     if(selected.tool == 'building'){ 
    //       griddots.style.display = 'none' 
    //     }
    //     if(selected.tool == 'road'){ 
    //       griddots.style.display = 'none' 
    //     }
    //   }
    // }
    // document.onkeyup = function(e){ 
    //   if(altPress){ 
    //     altPress = false; console.log('Alt up');
    //     if(selected.tool == 'building'){ 
    //       griddots.style.display = '' 
    //     }
    //     if(selected.tool == 'road'){ 
    //       griddots.style.display = '' 
    //     }
    //   }
    // }

    // Array.prototype.unique = function(){
    //   var hash = {};
    //   return this.filter(function (el) {
    //     var k = JSON.stringify(el);
    //     var match = Boolean(hash[k]);
    //     return (match ? false : hash[k] = true);
    //   });
    // }




  </script-->
  </div>
</template>

<script>
export default {
  name: 'builder',
  components: {},
  data () {
    var distX = 20,
        canvasWidth = 600,
        marginX = distX/2;
    return {
      distX: distX,
      distY: Math.pow( Math.pow(distX,2) - Math.pow(distX/2,2) , 0.5),
      marginX: marginX,
      marginY: 30,
      canvasHeight: 498,
      canvasWidth: 600,
      antalPunkterXled: (canvasWidth-marginX)/(distX/2),
      translate: { _x:0, _y:0 },
      rotation: { origin: {_x:0, _y:0}, angle:0, tr_conv: {
          nf: [[-1,-1],[0,-1],[0,0],[-1,0],[-2,0],[-2,-1]], 
          f: [[-1,0],[-2,0],[-2,-1],[-1,-1],[0,-1],[0,0]]} 
      },

      selected: {tool:''},

      currentpiece: {},
      boardgame: {},
      boardgames: [],
      boardpieces: [],

      fieldTools: [
          {name:'trä', tool: 'field', type: 'trä', color: '#1abc9c'}, 
          {name:'sten', tool: 'field', type: 'sten', color: 'lightgray'}, 
          {name:'olja', tool: 'field', type: 'olja', color: '#B697D8'}, 
          {name:'säd', tool: 'field', type: 'säd', color: '#f1c40f'}, 
        {name:'djur', tool: 'field', type: 'djur', color: '#75B96B'}
      ],

      tools: [
        {name:'new', tool: 'new', fieldTools: this.fieldTools}, 
          {name:'edit', tool: 'edit'}, 
          {name:'road', tool: 'road'}, 
          {name:'building', tool: 'building'}, 
        {name:'number', tool: 'number'},
        {name:'move', tool: 'move', translate: {_x: 0, _y: 0}},
        {name:'hand', tool: 'hand'}
      ],
      newfieldIsOpen: false,

      mdown: false,
      altPress: false,

      griddotsDisplay: 'none',

       
    }
  },
  computed: {
    mesh: function(){
      console.log(this._position)
      var meshArray = [];
      var index = 0;
      var _pos = new this._position(0,0);
      for (var y = this.marginY; y < this.canvasHeight; y+= this.distY) {
        _pos._x = 0;
        for (var x = this.marginX; x < this.canvasWidth; x+= this.distX/2) {
          var flip = !flip;
          meshArray.push({
            index: _pos._x+'-'+_pos._y, 
            _pos: new this._position(_pos._x,_pos._y),
            flip: flip
          })
          index++;
          _pos._x++;
        }
        _pos._y++;
      }
      return meshArray;
    },
    dotmesh: function(){ 
      return this.mesh.filter(function(m){return !m.flip });
    },
  },
  methods: {

    /*****************************
        GLOBAL PAINT FUNCTIONS
    ******************************/

    toTrianglePoints: function(d){
      return [
        [d._pos.toX(0,d.flip),    d._pos.toY(0, d.flip)],
        [d._pos.toX(2,d.flip),    d._pos.toY(2, d.flip)],
        [d._pos.toX(1,!d.flip),   d._pos.toY(1, !d.flip)]
      ].map(function(p){return p.join(',')}).join(' '); 
    },

    /*****************************
                 Mesh
    ******************************/

    

    /*****************************
                 GRID
    ******************************/

    // Traingle

    _gridTrianlgeMouseDown: function(d){
      console.log('mousedown')
      this.mdown = true;
      if(this.selected.tool == 'field'){ 
        this.altPress ? 
          this.currentpiece.removeField(d) : 
          this.currentpiece.addField(d, selected.type, selected.color) ;
        // this.currentpiece.updateFields()
      }
    },
    _gridTrianlgeMouseOver: function(d){
      if(this.mdown && this.selected.tool != ''){
        if(this.selected.tool == 'field'){ 
          this.altPress ? 
            this.currentpiece.removeField(d) : 
            this.currentpiece.addField(d, this.selected.type, this.selected.color) ;
          // this.currentpiece.updateFields()
        }
      }
    },
    _gridTrianlgeMouseUp: function(){
      console.log('mouseup')
      this.mdown = false;
    },

    // Dots

    _gridDotMouseDown: function(d){
      this.mdown = true;
      if(this.selected.tool=='road'){
        this.currentpiece.setRoadStart(d)
      }
      if(this.selected.tool == 'move'){
        this.currentpiece.setStartMotion(d)
      }
    },
    _gridDotMouseOver: function(d){
      if(this.mdown && this.selected.tool=='road'){
        this.currentpiece.setRoadEnd(d)
      }
      if(this.mdown && this.selected.tool == 'move' && d.flip == this.selected.flip){
        this.currentpiece.moveContent(d)
      }
    },
    _gridDotMouseUp: function(d){
      if(this.selected.tool=='road'){
        this.currentpiece.setRoadEnd(d)
        this.currentpiece.saveRoad()
        // this.currentpiece.updateRoads();
      }
      if(this.selected.tool == 'move' && (this.translate._x || this.translate._y || this.rotation.angle) ){
        this.currentpiece.translateMotion(d)
      }
      this.mdown = false;
    },
    _gridDotClick: function(d){
      if(this.selected.tool=='building'){
        this.currentpiece.setBuilding(d)
      }
    },

    /*****************************
          MENU / TOOLS
     *****************************/

    selectTool: function(i,d){
      if(this.boardgame.bps.length>1 && i<=4){
        alert('Vill du ändra något i nån bricka behöver du söka upp brickan längre ner på sidan och klicka edit.')
        return
      }
      this.selected = i ? this.tools[i] : d ;
      console.log('selected tool: '+ this.selected.tool);
    },



  },
  beforeMount: function(){
    let self = this;
    this._position = function(_x = 0, _y = 0) {
      return {
        _x: _x,
        _y: _y,
        x_ny: 0,
        y_ny: 0,

        toX: function(shift_x = 0, shift_y = 0){
          return this.rotateX(shift_x, shift_y) * self.distX/2 + self.marginX ;
        },
        toY: function(shift_x = 0, shift_y = 0){
          return this.rotateY(shift_x, shift_y) * self.distY + self.marginY ;
        },
        rotateX: function(shift_x = 0, shift_y = 0){
          if(self.altPress && self.selected.tool == 'move'){ 
            var x = (this._x + shift_x - self.rotation.origin._x)/2;
            var y = (this._y + shift_y - self.rotation.origin._y)* self.distY/self.distX;
            var x_ny = x * Math.cos(self.rotation.angle) - y * Math.sin(self.rotation.angle) ;
            this.x_ny = Math.round((x_ny * 2) + self.rotation.origin._x + self.translate._x);
            return Math.round((x_ny * 2) + self.rotation.origin._x + self.translate._x);
          }else{
            this.x_ny = this._x + shift_x + self.translate._x;
            return this._x + shift_x + self.translate._x;
          }
        },
        rotateY: function(shift_x = 0, shift_y = 0){
          if(self.altPress && self.selected.tool == 'move'){ 
            var x = (this._x + shift_x - self.rotation.origin._x)/2;
            var y = (this._y + shift_y - self.rotation.origin._y)* self.distY/self.distX;
            var y_ny = x * Math.sin(self.rotation.angle) + y * Math.cos(self.rotation.angle) ;
            this.y_ny = Math.round((y_ny * self.distX/self.distY) + self.rotation.origin._y + self.translate._y) ;
            return Math.round((y_ny * self.distX/self.distY) + self.rotation.origin._y + self.translate._y) ;
          }else{
            this.y_ny = this._y + shift_y + self.translate._y;
            return this._y + shift_y + self.translate._y;
          }
        }
      }
    }

  },
  mounted: function(){
    let self = this;
    document.onmousedown = function(){
      self.mdown = true;
    }
    document.onmouseup = function(){
      self.mdown = false;
    }
    document.onkeydown = function(e){ 
      if(e.altKey){ 
        self.altPress = true; console.log('Alt press');
        if(self.selected.tool == 'building'){ 
          self.griddotsDisplay = 'none' 
        }
        if(self.selected.tool == 'road'){ 
          self.griddotsDisplay = 'none' 
        }
      }
    }
    document.onkeyup = function(e){ 
      if(self.altPress){ 
        self.altPress = false; 
        console.log('Alt up');
        if(self.selected.tool == 'building'){ 
          self.griddotsDisplay = '' 
        }
        if(self.selected.tool == 'road'){ 
          self.griddotsDisplay = '' 
        }
      }
    }
    Array.prototype.unique = function(){
      let hash = {};
      return this.filter(function (el) {
        let k = JSON.stringify(el);
        let match = Boolean(hash[k]);
        return (match ? false : hash[k] = true);
      });
    }

    // Init
    this.boardgame = new boardgameClass();
    this.boardgame.bps[0] = this.boardpieces[0] = this.currentpiece = new boardpieceClass();
    // updateFrame()
    // updateAllBoards()
    console.log(this.boardgame)
  },
  sockets:{

  }
}

var boardgameClass = function(){
  this.id = c4()+'_'+c4()+'_'+c4();
  this.bps = []
}

var boardpieceClass = function(boardpiece){
  let self = this;
  boardpiece = boardpiece || {};
  this.id = boardpiece.id || c4()+'-'+c4()+'-'+c4();
  this.fields = boardpiece.fields || [];
  this.roads = boardpiece.roads || [];
  this.buildings = boardpiece.buildings || [];

  this.svg = '' || boardpiece.svg;

  /**********************/
  /*       FIELDS       */
  /**********************/

  this.updateFields = function(){

    console.log('g#fields_'+self.id)
    self.fieldsGroup = d3.select('g#fields_'+self.id).selectAll('g.field')
          .data(self.fields)
          .html(paintNumberBadge)
          .attr('id', function(d){return d.id })
          .attr('class', function(d){return 'field '+d.type })
          .attr('type', function(d){return d.type })
        .on('click', function(d){
          if(selected.tool=='edit'){ self.editField(d) }
        }); 

    self.fieldsGroup.enter().append('g')
          .html(paintNumberBadge)
          .attr('id', function(d){return d.id })
          .attr('class', function(d){return 'field '+d.type })
          .attr('type', function(d){return d.type })
        .on('click', function(d){
          if(selected.tool=='edit'){ self.editField(d) }
        });

    self.fieldsGroup.exit().remove();

    var f = self.fieldsGroup.selectAll('polygon')
          .data(function(d){ return d.array})
          .attr('points', toTrianglePoints)
          .on('click',function(d){
            if(selected.tool=='number'){
              self.setFieldNumber(d, fields)
            }
          });

      f.enter().insert('polygon',':first-child')
          .attr('points', toTrianglePoints)
          .on('click',function(d){
            if(selected.tool=='number'){
              self.setFieldNumber(d, fields)
            }
          });

      f.exit().remove();


    var list = d3.select('#list').selectAll('p')
        .data(self.fields)
        .text(function(d) {return d.type+' '+d.array.length})

      list.enter().append('p')
        .text(function(d) {return d.type+' '+d.array.length})

      list.exit().remove()

  }

  // FUNCITONS

  this.editField = function(d){
    self.current_field = self.fields[self.fields.indexOf(d)]
    selectTool(0, tools[0].fieldTools.find(function(t){return t.type == d.type;}))
  }

  this.createField = function(d){
    selected = d;
    // Remove empty fields
    self.fields = self.fields.filter(function(a){return a.array[0] != undefined })
    self.current_field = {
      id: c4()+'-'+c4(),
      type: d.type,
      array: []
    };
    self.fields.push(self.current_field)
  }

  this.addField = function(d, type, color){
    if(self.current_field.array.find((t)=>{return t.index==d.index}) == undefined ){
      self.current_field.array.push({
        refid: self.current_field.id,
          index: d.index,
          _pos: new _position( d._pos._x, d._pos._y ),
          flip: d.flip,
          fill: color,
          type: type
        })
    } 
  }

  this.setFieldNumber = function(d){
    var l = self.fields.find((f)=>{return f.id == d.refid})
    l.number = {_pos: d._pos, nr: '?'};
    self.updateFields()
  }

  this.removeField = function(d){ // When ALT-pressed
    if(self.current_field.array.find((f)=>{return f.index==d.index}) != undefined ){
      self.current_field.array.splice(
        self.current_field.array.indexOf(
          self.current_field.array.find(function(f){
            return f.index==d.index
          })
        )
      ,1)
    }
  }



  /**********************/
  /*        ROADS       */
  /**********************/

  this.prelRoad = []

  this.updateRoads = function(){

    var data = self.prelRoad[0] ? self.roads.concat([self.prelRoad]) : self.roads ;

    self.roadsGroup = d3.select('#roads_'+self.id).selectAll('g.road')
      .data(data)
      .html(paintRoads);

    self.roadsGroup.enter().append('g')
      .attr('class', 'road')
      .html(paintRoads)
      .on('click', function(d){ 
        if( selected.tool == "road" && altPress ){ self.removeRoad(d) }
      }); 

    self.roadsGroup.exit().remove();
  }

  // FUNCTIONS

  this.setRoadStart = function(d){
    altPress ? 'pass' : self.prelRoad=[ new _position(d._pos._x, d._pos._y), new _position(d._pos._x, d._pos._y)] ;
    self.updateRoads();
  }

  this.setRoadEnd = function(d){
    if(!altPress){ 
      self.prelRoad[1]._x = d._pos._x; 
      self.prelRoad[1]._y = d._pos._y;
    }
    self.updateRoads();
  }

  this.saveRoad = function(d, roads){
    self.roads.push(self.prelRoad)
    self.prelRoad=[]
    self.updateRoads();
  }

  this.removeRoad = function(d){ // When ALT-pressed
    var arr = self.roads.map(function(f){return ''+f[0]._x+f[0]._y+f[1]._x+f[1]._y==''+d[0]._x+d[0]._y+d[1]._x+d[1]._y ; });
    var index = arr.indexOf(true)
    self.roads.splice( index,1) 
    self.updateRoads();
  }


  /**********************/
  /*      BUILDINGS     */
  /**********************/

  this.updateBuildings = function(){

    self.buildingsGroup = d3.select('g#buildings_'+self.id).selectAll('g.building')
        .data(self.buildings)
        .attr('id', function(d){return d.id })
        .html(paintBuildings);

    self.buildingsGroup.enter().append('g')
        .attr('class', 'building')
        .attr('id', function(d){return d.id })
        .html(paintBuildings)
      .on('click', function(d){ /**** DELETE BUILDINGSITE ****/
        if(selected.tool=='building' && altPress ){
          self.removeBuilding(d);
        }
      });

    self.buildingsGroup.exit().remove();


    var sites = d3.select('#sites').selectAll('p')
        .data(buildings)
        .text(function(d) {return 'Byggplats: '+d.fields.map((f)=>{return f.type}).join(' ')})
    
      sites.enter().append('p')
        .text(function(d) {return 'Byggplats: '+d.fields.map((f)=>{return f.type}).join(' ')})

      sites.exit().remove()

  }

  // FUNCTIONS

  this.setBuilding = function(d){
    var arr = [ 
      new _position(d._pos._x-2, d._pos._y), new _position(d._pos._x-1, d._pos._y), new _position(d._pos._x,d._pos._y), 
      new _position(d._pos._x-2, d._pos._y-1), new _position(d._pos._x-1,d._pos._y-1), new _position(d._pos._x, d._pos._y-1)
    ]
    var a = arr.map((ai,i)=>{
      var match = self.fields.map((fie)=>{return fie.array.find((f)=>{ return ai._x+'-'+ai._y == f.index }) }).filter((v)=>{return v})[0] 
      return match ? {index: ai._x+'-'+ai._y, _pos: ai, flip: i%2==1, refid: match.refid, type: match.type} : {index: ai._x+'-'+ai._y, _pos: ai, flip: i%2==1};
    })
    var b = {
      id: c4()+'-'+c4(),
      array: a,
      fields: a.map(function(a){return a.refid ? {refid: a.refid, type: a.type} : {refid: c4(), type: 'empty'};}).unique()
    }
    self.buildings.push(b)
    self.updateBuildings()
  }

  this.removeBuilding = function(d){
    self.buildings.splice(self.buildings.map((b)=>{return b.id==d.id;}).indexOf(true),1)
    self.updateBuildings()
  }


  /* Motion */

  this.setStartMotion = function(d){
    if(selected.tool == 'move'){
      translate = { _x: 0, _y: 0 };
      selected._pos = d._pos;
      selected.flip = d.flip;
      rotation.origin = d.flip ? {_x: d._pos._x+1, _y: d._pos._y}: d._pos; 
      rotation.angle = 0;
    }
  }

  this.moveContent = function(d){
    if(mdown && selected.tool == 'move' && d.flip == selected.flip){
      if(altPress){ 
        rotation.angle = ( d._pos._y-(rotation.origin._y+translate._y) ) * Math.PI*2/6 ;
      }else{
        translate = { _x: d._pos._x-selected._pos._x, _y: d._pos._y-selected._pos._y };
      }
      self.updateAll()
    }
  }

  this.translateMotion = function(d){
    if(selected.tool == 'move' && (translate._x || translate._y || rotation.angle) ){
      self.fields = self.fields.map((field)=>{ return transformField( field, translate._x, translate._y )})
      self.roads = self.roads.map((road)=>{ return transformRoad( road, translate._x, translate._y )});
      self.buildings = self.buildings.map((building)=>{return transformBuilding( building, translate._x, translate._y )})
      self.resetTransform()
      self.updateAll()
    }
  }

  this.resetTransform = function(){
    translate = { _x: 0, _y: 0 };
    rotation.origin = { _x: 0, _y: 0 };
    rotation.angle = 0;
  }

  this.save = function(){
    var max_x = Math.max(...self.fields.map((field)=>{return Math.max(...field.array.map((d)=>{return d._pos._x}))}))
    var max_y = Math.max(...self.fields.map((field)=>{return Math.max(...field.array.map((d)=>{return d._pos._y}))}))
    var min_x = Math.min(...self.fields.map((field)=>{return Math.min(...field.array.map((d)=>{return d._pos._x}))}))
    var min_y = Math.min(...self.fields.map((field)=>{return Math.min(...field.array.map((d)=>{return d._pos._y}))}))

    // // TRANSFORM
    // var new_fields = JSON.parse(JSON.stringify(self.fields));
    //  new_fields = new_fields.map((field)=>{ return transformField( field, -min_x, -min_y )})
    // var new_roads = JSON.parse(JSON.stringify(self.roads));
    //  new_roads = new_roads.map((road)=>{ return transformRoad( road, -min_x, -min_y )});
    // var new_buildings = JSON.parse(JSON.stringify(self.buildings));
    //  new_buildings = new_buildings.map((building)=>{ return transformBuilding( building, -min_x, -min_y )})

    var temp = JSON.parse(JSON.stringify(translate));
    translate = {_x: -min_x, _y: -min_y}
    self.updateAll()
    var svgxml = document.getElementById(self.id).innerHTML;
    self.svg = '<svg width="'+((max_x-min_x+2)*distX/2+marginX*2)+'" height="'+((max_y-min_y+1)*distY+marginY*2)+'">'+svgxml+'</svg>';
    translate = temp;
    self.updateAll()

    if(boardpieces.find((b)=>{ return b.id == self.id }) != undefined){
      boardpieces = boardpieces.map((b)=>{ return b.id == self.id ? new boardpieceClass(currentpiece) : b ;})
    }else{
      boardpieces.push(new boardpieceClass(currentpiece));
      updateFrame()
    }
    paintBoardPieces()
    updateAllBoards()
  }

  this.updateAll = function(){
    self.updateFields()
    self.updateRoads()
    self.updateBuildings()
  }
}

var c4 = function(){ // Random id generator
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}
</script>

<style scoped>


  .st0{fill:url(#SVGID_1_);stroke: darkgray; stroke-width: 0.5;}
  .st1{fill:url(#SVGID_2_);}
  .st2{fill:url(#SVGID_3_);}
  .st3{fill:url(#SVGID_4_);}
  .st4{fill:#606060;}
  .st5{fill:#FFFFFF;stroke:#FFFFFF;stroke-width:0.5;stroke-miterlimit:10;}
  .st6{fill:url(#SVGID_5_);}
  .st7{fill:#FFFFFF;}
  .st8{font-family:'Helvetica';}
  .st9{font-size:5px;}
  .st10{font-size:13px;}
  .st11{font-size:15px;}

  .trä{background-color: #1abc9c;}
  .sten{background-color: #FFFFFF;}
  .olja{background-color: #B697D8;}
  .säd{background-color: #f1c40f;}
  .djur{background-color: #75B96B;}





 /* body{
    font-family: helvetica;
  }*/

  html {
    position: relative;
    overflow: auto;
  }  
  body {
    position: relative;
    overflow: auto;
  }

  p, h1, h2, h3, h4, h5, h6 {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*font-family: 'Calibri', Verdana, Geneva, sans-serif;*/
    color: #000;
    margin-bottom: 0px;
    text-align: left;
  }
  #canvas{
    cursor: crosshair;
  }
  .menuitem.newfield{
    background-image: linear-gradient( 135deg, #81FBB8 10%, #28C76F 100%);
  }
  #menu * {
    cursor: pointer;
  }
  #fields * {
    cursor: pointer;
  }

  .savedBP > * {
    display: inline-block;
    vertical-align: top;
  }

  .savedBP button {
    display: block;
    margin-top: 10px;
    background: #1abc9c;
    font-family: Helvetica;
    font-weight: 600;
    color: black;
    font-size: 14px;
    border: none;
    border-radius: 20px;
    padding: 5px 20px;
    box-shadow: 1px 2px 0px 0px hsla(168, 76%, 34%, 1);
  }




  .triangle {
      stroke: rgba(0, 0, 0, 0.1);
    stroke-width: 1;
    fill: rgba(0, 0, 0, 0);
  }
  .triangle:hover {
    fill: lightgray;
    opacity: 0.7;
    transition: 0.1s;
  }
  .dot {
    fill: lightgray;
    stroke: rgba(0, 0, 0, 0);
  stroke-width: 20;
  }
  .dot:hover {
    r: 5;
    stroke-width: 15; 
    fill: darkgray;
    transition: 0.1s;
  }
  .field circle {
    fill: #606060;
  }
  .field text {
    text-anchor: middle;
    fill: #FFFFFF;
    font-family: 'Helvetica';
    font-size:13px;
  }
  .road {
    fill: #606060; 
    stroke: #606060;
    stroke-width: 4;
  }
  .building {
      fill: black;
      fill-opacity: 0.6;
  }


  .field.trä polygon{ 
    fill: #1abc9c;
  }
  .field.sten polygon{ 
    fill: lightgray;
  }
  .field.olja polygon{ 
    fill: #B697D8;
  }
  .field.säd polygon{ 
    fill: #f1c40f;
  }
  .field.djur polygon{ 
    fill: #75B96B;
  }

</style>

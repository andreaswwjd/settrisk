<template>
  <div id="builder">
    <div id="bg">
      <div style="max-width: 650px; margin: 40px auto;background: white; color: black;">
        <h1>Gameboard</h1>

        <svg id="canvas" v-bind:height="canvasCalcHeight" v-bind:width="canvasCalcWidth" v-bind:class="selected.tool+'_btn'">
          <!-- v-on:mousedown="mousedown" v-on:mousemove="mousemove" v-on:mouseup="mouseup" -->
          <defs>

            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="8" y2="8">
              <stop  offset="0" style="stop-color:#FFFFFF"/>
              <stop  offset="1" style="stop-color:#dcdcdc"/>
            </linearGradient>

            <symbol id="svg-sad">
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

            <symbol id="svg-tra">
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

            <symbol id="svg-gras">
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
          
          <g id="boardgame" >
            <boardpiece v-for="bp in boardgame.boardpieces" :key="bp.id" v-bind:style="{opacity: bp.id==boardpiece.id ? 1 : 0.6}"
            v-bind:boardpiece="bp" 
            v-bind:selected="selected" 
            v-on:editField="editField"
            v-on:clickboard="()=>{if(selected.tool == 'hand'){ boardpiece = bp; selectTool(5)}}"
            v-on:triangleclick="setFieldNumber"
            v-on:removeBuilding="remove">
              <g v-bind:transform="'rotate('+bp.transform.rotation.angle/Math.PI*180+' '+(bp.transform.rotation.origin[0]+bp.transform.translate[0])+' '+(bp.transform.rotation.origin[1]+bp.transform.translate[1])+') translate('+bp.transform.translate.join(' ')+')'" >
                <field v-for="f in bp.fields" :key="f.id" class="passive" v-bind:style="{pointerEvents: fieldPointerEvents}"
                  v-bind:field="f" 
                  v-on:fieldclick="selected.tool=='edit' ? editField(f):'';" 
                  v-on:triangleclick="setFieldNumber"
                  v-on:numberclick="removeFieldNumber"
                ></field>
                <road v-for="road in bp.roads" :key="road.id" v-bind:style="{pointerEvents: selected.tool=='road' ? 'auto' : 'none'}" 
                  v-bind:road="road" 
                  v-on:click="selected.tool=='road' && altPress?remove(bp.roads,road):0" 
                ></road>
                <buildsite v-for="buildsite in bp.buildsites" :key="buildsite.id" v-bind:style="{pointerEvents: selected.tool=='building' ? 'auto' : 'none'}" 
                  v-bind:buildsite="buildsite" 
                  v-on:click="selected.tool == 'building' && altPress ? remove(bp.buildsites, buildsite) :'';" 
                ></buildsite>
              </g>
            </boardpiece>
          </g>

          <g id="grid" v-bind:style="{pointerEvents: gridPointerEvents}">
            <polygon v-for="d in mesh" v-bind:key="d.t.join('')" v-bind:points="d.t.join(' ')" class="triangle" v-once
              v-on:mousedown="mdown=true;_gridTrianlgeMouseOver(d);"
              v-on:mouseenter="_gridTrianlgeMouseOver(d)"
              v-on:mouseup="mdown=false"></polygon>
          </g>

          <g id="griddots" v-bind:style="{display: griddotsDisplay, pointerEvents: griddotsPointerEvents}">
            <circle class="dot" v-for="d in mesh"  v-bind:key="d.p.join('')" v-bind:cx="d.p?d.p[0]:0" v-bind:cy="d.p?d.p[1]:0" r="0" v-once
              v-on:mousedown="_gridDotMouseDown(d)"
              v-on:mouseover="_gridDotMouseOver(d)"
              v-on:mouseup="_gridDotMouseUp(d)"
              v-on:click="_gridDotClick(d)"
              ></circle>
          </g>

          <g v-if="field.id" >
            <field v-bind:style="{pointerEvents: altPress ? 'none': 'auto'}" class="active"
            v-bind:field="field"></field>
          </g>
          <g v-if="road.id" ><road v-bind:road="road" style="pointer-events: none;"></road></g>

          <g id="menu">
            <g>
              <text style="transform: translateY(20px); font-weight: bold; text-decoration: underline; ">{{mode=='boardpiece'? 'BRICKA':'SPELPLAN'}}</text>
            </g>
            <g id="new_btn" v-on:click="newfieldIsOpen = !newfieldIsOpen" style="transform: translateX(80px);" v-bind:class="{toolbtn: true, active: selected.tool=='field'}">
              <title>Create New Field</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <polygon class="st4" points="12.5,2.8 1.9,21.1 23.1,21.1 "/>
              <text transform="matrix(1 0 0 1 8.0625 18.5)" class="st5 st6 st7 st11">+</text>
              <g id="new_fields_group" v-if="newfieldIsOpen">
                <g v-for="d in fieldTools" v-on:click="selectTool(0, d);" v-bind:style="{opacity: newfieldIsOpen, transform: newfieldIsOpen ? 'translateY('+ (24 * fieldTools.indexOf(d) + 25) +'px)' : ''}">
                  <path v-bind:fill="d.color" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
                  <svg width="25px" height="25px" viewBox="0 0 100 100"><use v-bind:xlink:href="'#svg-' + d.type"></use></svg>
                </g>
              </g>
            </g>
            <g id="edit_btn" v-on:click="selectTool(1)" style="transform: translateX(110px);" v-bind:class="{toolbtn: true, active: selected.tool=='edit'}">
              <title>Edit Field</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <polygon class="st4" points="12.5,2.8 1.9,21.1 23.1,21.1 "/>
              <text transform="matrix(1 0 0 1 6.9375 18.5)" class="st7 st8 st9">EDIT</text>
            </g>
            <g id="road_btn" v-on:click="selectTool(2)" style="transform: translateX(140px);" v-bind:class="{toolbtn: true, active: selected.tool=='road'}">
              <title>Create/Edit Road</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <path class="st4" x="30" d="M17.5,5C16.1,5,15,6.1,15,7.5c0,0.3,0.1,0.6,0.2,0.9l-6.8,6.8C8.1,15.1,7.8,15,7.5,15C6.1,15,5,16.1,5,17.5           C5,18.9,6.1,20,7.5,20c1.4,0,2.5-1.1,2.5-2.5c0-0.3-0.1-0.6-0.2-0.9l6.8-6.8c0.3,0.1,0.6,0.2,0.9,0.2c1.4,0,2.5-1.1,2.5-2.5            S18.9,5,17.5,5z"/>
            </g>
            <g id="building_btn" v-on:click="selectTool(3)" style="transform: translateX(170px);" v-bind:class="{toolbtn: true, active: selected.tool=='building'}">
              <title>Create/Edit Building-site</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <polygon class="st4" points="17.5,3.8 7.5,3.8 2.5,12.5 7.5,21.2 17.5,21.2 22.5,12.5 "/>
            </g>
            <g id="nr_btn" v-on:click="selectTool(4)" style="transform: translateX(200px);" v-bind:class="{toolbtn: true, active: selected.tool=='number'}">
              <title>Add numberplate</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <circle class="st4" cx="12.5" cy="12.5" r="8.1"/>
              <text transform="matrix(1 0 0 1 9.127 16.3157)" class="st6 st7 st8 st10">§</text>
            </g>
            <g id="move_btn" v-on:click="selectTool(5)" style="transform: translateX(250px);" v-bind:class="{toolbtn: true, active: selected.tool=='move'}">
              <title>Move/Rotate</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <circle class="st4" cx="12.5" cy="12.5" r="8.1"/>
              <polygon class="st7" points="18.5,12.5 16.2,10.2 16.2,11.5 13.5,11.5 13.5,8.8 14.8,8.8 12.5,6.5 10.2,8.8 11.5,8.8 11.5,11.5 8.8,11.5 8.8,10.2 6.5,12.5 8.8,14.8 8.8,13.5 11.5,13.5 11.5,16.2 10.2,16.2 12.5,18.5 14.8,16.2 13.5,16.2 13.5,13.5 16.2,13.5 16.2,14.8 "/>
            </g>
            <g id="hand_btn" v-on:click="selectTool(6)" style="transform: translateX(280px);" v-bind:class="{toolbtn: true, active: selected.tool=='hand'}">
              <title>Choose what to move</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h19c1.7,0,3,1.3,3,3v19C25,23.7,23.7,25,22,25z"/>
              <circle class="st4" cx="12.5" cy="12.5" r="8.1"/>
              <path class="st7" d="M12.3,7.2c0.1,0,0.3,0,0.4,0c0,0,0,0,0.1,0c0.3,0,0.5,0.1,0.8,0.3c0.1,0,0.1,0,0.2,0C14.5,7.1,15.4,7.3,16,8          c0,0.1,0.1,0.1,0.2,0.1c0.2,0,0.5,0,0.7,0c0.8,0.2,1.4,0.9,1.4,1.8c0,0.6,0,1.3,0,1.9c0,0.2,0,0.5-0.1,0.7          c-0.2,0.9-0.4,1.8-0.7,2.6c-0.1,0.4-0.2,0.8-0.2,1.2c0,0.9-0.6,1.5-1.5,1.5c-1.6,0-3.2,0-4.8,0c-0.1,0-0.3,0-0.4-0.1          c-0.6-0.2-1-0.7-1-1.3c0-0.1,0-0.2-0.1-0.2c-0.7-0.7-1.5-1.4-2.2-2.1c-0.4-0.3-0.6-0.7-0.6-1.2c0-0.6,0-1.3,0-1.9          c0-0.8,0.7-1.5,1.5-1.7c0.1,0,0.3,0,0.4,0c0.1-1.2,1.3-2,2.5-1.6c0,0,0.1,0,0.1,0c0.2-0.2,0.5-0.3,0.8-0.4          C12.1,7.2,12.2,7.2,12.3,7.2z M15.4,10.1c0,0,0-0.1,0-0.1c0-0.3,0-0.6,0-0.8c0-0.5-0.4-0.9-0.9-0.9c-0.5,0-0.9,0.4-0.8,0.9          c0,0.1,0,0.2,0,0.3c0,0.2,0,0.4,0,0.6c-0.1,0-0.2,0-0.2,0c0-0.1,0-0.1,0-0.2c0-0.3,0-0.6,0-0.9c0-0.5-0.5-0.9-1-0.9          c-0.5,0-0.9,0.4-0.9,0.9c0,0.3,0,0.6,0,0.9c0,0.1,0,0.1,0,0.2c-0.1,0-0.2,0-0.2,0c0-0.3,0-0.5,0-0.8c0-0.4-0.3-0.7-0.7-0.8          c-0.6-0.1-1,0.3-1,0.9c0,1,0,2,0,3c0,0,0,0.1,0,0.2c-0.1-0.1-0.3-0.2-0.2-0.4c0-0.3,0-0.6,0-0.9c0-0.1,0-0.3,0-0.4          c-0.1-0.4-0.5-0.7-0.9-0.7c-0.5,0-0.8,0.4-0.8,0.8c0,0.5,0,1.1,0,1.6c0,0.3,0.1,0.6,0.3,0.8c0.7,0.7,1.5,1.4,2.2,2.1          c0.2,0.2,0.4,0.5,0.4,0.8c0,0.3,0.2,0.5,0.5,0.5c1.6,0,3.2,0,4.7,0c0.3,0,0.5-0.2,0.5-0.5c0-0.2,0-0.4,0-0.6          c0.2-0.8,0.4-1.6,0.6-2.4c0.1-0.4,0.3-0.9,0.3-1.3c0.1-0.7,0-1.5,0-2.2c0-0.5-0.4-0.8-0.9-0.8c-0.4,0-0.8,0.4-0.8,0.9          c0,0.1,0,0.1,0,0.2C15.6,10.1,15.5,10.1,15.4,10.1z"/>
            </g>
            <g id="save_btn" v-on:click="saveBoard()" style="transform: translateX(450px);">
              <title>Save component</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h42c1.7,0,3,1.3,3,3v19C48,23.7,46.7,25,45,25z"/>
              <text transform="matrix(1 0 0 1 9.127 16.3157)" fill="#000" class="st8 st10">Save</text>
            </g>
            <g id="new_bp_btn" v-on:click="newBp()" style="transform: translateX(510px);">
              <title>New component</title>
              <path class="st0" d="M22,25H3c-1.7,0-3-1.3-3-3V3c0-1.7,1.3-3,3-3h42c1.7,0,3,1.3,3,3v19C48,23.7,46.7,25,45,25z"/>
              <text transform="matrix(1 0 0 1 9.127 16.3157)" fill="#000" class="st8 st10">New</text>
            </g>
            <g style="transform: translateX(650px);">
              <text style="transform: translateY(20px); font-weight: bold; text-decoration: underline; text-transform: uppercase; text-anchor: end;" v-bind:fill="selected.color">{{selected.tool}}</text>
            </g>  
          </g>

          
        </svg>
        <h1>Instruktioner:</h1>
        <strong>Kortkomandon:</strong> Verktyg: <tt>'f,1-5'</tt>-field, <tt>'e'</tt>-edit, <tt>'r'</tt>-road, <tt>'b'</tt>-building, <tt>'n'</tt>-number, <tt>'h'</tt>-move, <tt>'1-5'</tt> fält
        <ol>
          <li><p>Varje gång en fältpensel väljs skapas ett nytt "fält", med unika egenskaper. Måla därför hela fältet på en gång. Vill du senare ändra på fältet använder du <svg height="15" width="15" viewBox="0 0 25 25"><use xlink:href="#edit_btn"></use></svg> edit-verktyget och väljer vilket fält du vill ändra. Till hjälp har du fälten uppradade nedan.</p></li>
          <li><p>Det finns inget 'ångra' eller <tt>[cmd-z]</tt>. Håll ner <tt>[alt]</tt>-tangenten för att radera objekt för respektive verktyg.</p></li>
          <li><p>Ett tips är att börja med vägarna. Resten blir lättare när man ser ramen.</p></li>
          <li><p>För skalaenlighet rekommenderas vägarna ha en längd på 5 (med viss flexibilitet för specialfall såklart).</p></li>
          <li><p>Innan brickan går att spara behöver alla fält ha en nummerbricka. Använd <svg height="15" width="15" viewBox="0 0 25 25"><use xlink:href="#nr_btn"></use></svg> nummer-verktyget.</p></li>
          <li><p>Spara brickan genom att kopiera datan längst ner på sidan i ett textdokument. <strong>OBS! All data förloras om du uppdaterar sidan!</strong></p></li>
        </ol>
        <h1>Brickor:</h1>
        <div id="list">
          <p v-for="(bp,i) in boardgame.boardpieces" :key="bp.id" v-bind:renderBuildsiteFields="renderBuildsiteFields">
            <strong>Bricka {{i+1}}</strong><br>
            <span v-for="(field,i) in bp.fields">
              &nbsp;&nbsp;&nbsp;&nbsp;Fält {{i+1}}: {{field.type+' '+(field.number||'')}}<br>
            </span>
            <span v-for="(buildsite,i) in bp.buildsites">
              &nbsp;&nbsp;&nbsp;&nbsp;Byggnad {{i+1}}: <span v-for="field in buildsite.fields">{{field.type+' '+(field.nr||'')}}, </span><br>
            </span>
          </p>
        </div>
        <h1>Data:</h1>
        <p>Kopiera datan i fältet nedan och spara i ett textdokument.</p>
      
        <div id="saved" style="display: inline-block;">
          <div v-for="bp in boardpieces" :key="bp.id">
            <h3>{{bp.name}}</h3>
            <svg v-bind:height="canvasHeight/6" v-bind:width="canvasWidth/6" viewBox="0 0 600 498" preserveAspectRatio="xMinYMax meet" style="display: inline-block; pointer-events: none">
              <boardpiece v-bind:boardpiece="bp" >
                <g>
                  <field v-for="f in bp.fields" :key="f.id" class="passive" v-bind:field="f"></field>
                  <road v-for="road in bp.roads" :key="road.id" v-bind:road="road" ></road>
                  <buildsite v-for="buildsite in bp.buildsites" :key="buildsite.id" v-bind:buildsite="buildsite" ></buildsite>
                </g>
              </boardpiece>
            </svg>
            <button v-on:click="boardgame.boardpieces.push(bp)">Add</button>
            <button v-on:click="init(bp)">Edit</button>
            <button v-on:click="$socket.emit('deleteboardpiece', bp)">Delete</button>
            <textarea v-bind:id="bp.id+'_input'" cols="40" rows="5">{{JSON.stringify(bp)}}</textarea>
            <button v-on:click="saveFromTextArea(bp)">Save from input</button>
          </div>
        </div>
        <h1>Spelplaner:</h1>
        <div id="boardgames" style="display: inline-block;">
          <div v-for="bg in boardgames" :key="bg.id">
            <svg v-bind:height="canvasHeight/3" v-bind:width="canvasWidth/3" viewBox="0 0 1800 1494" style="display: inline-block; pointer-events: none">
              <g v-for="bp in bg.boardpieces" :key="bp.id">
                <boardpiece v-bind:boardpiece="bp" >
                <g>
                  <field v-for="f in bp.fields" :key="f.id" class="passive" v-bind:field="f"></field>
                  <road v-for="road in bp.roads" :key="road.id" v-bind:road="road" ></road>
                  <buildsite v-for="buildsite in bp.buildsites" :key="buildsite.id" v-bind:buildsite="buildsite" ></buildsite>
                </g>
              </boardpiece>
              </g>
            </svg>
            <button v-on:click="boardgame = bg">Edit</button>
            <button v-on:click="$socket.emit('deleteboardgame', bg)">Delete</button>
            <textarea cols="40" rows="5">{{JSON.stringify(bg)}}</textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Boardpiece from '@/maps/Boardpiece'
import Field from '@/maps/Field'
import Road from '@/maps/Road'
import Buildsite from '@/maps/Buildsite'

export default {
  name: 'builder',
  components: { Boardpiece, Field, Road, Buildsite },
  data () {
    var distX = 20;
    return {
      canvasHeight: 498*3,
      canvasWidth: 650*3,
      // viewBox: [0,0,650*3,498*3],
      distX: distX,
      distY: Math.pow( Math.pow(distX,2) - Math.pow(distX/2,2) , 0.5),
      marginX: 0,
      marginY: 30,

      mdown: false,
      altPress: false,

      boardgames: [],
      boardpieces: [],
      boardgame: {},
      boardpiece: {},
      field: {},
      road: {},

      transform: [0,0],
      rotation: {
        angle: 0,
        origin: [0,0]
      },

      selected: {tool:''},
      fieldTools: [
        {name:'trä', tool: 'field', type: 'tra', color: '#1abc9c'}, 
        {name:'sten', tool: 'field', type: 'sten', color: 'lightgray'}, 
        {name:'olja', tool: 'field', type: 'olja', color: '#B697D8'}, 
        {name:'säd', tool: 'field', type: 'sad', color: '#f1c40f'}, 
        {name:'gräs', tool: 'field', type: 'gras', color: '#75B96B'}
      ],
      tools: [
        {name:'new', tool: 'new'}, 
        {name:'edit', tool: 'edit'}, 
        {name:'road', tool: 'road'}, 
        {name:'building', tool: 'building'}, 
        {name:'number', tool: 'number'},
        {name:'move', tool: 'move'},
        {name:'hand', tool: 'hand'}
      ],
      newfieldIsOpen: false,

       
    }
  },
  computed: {
    mode: function(){
      if(!this.boardgame.boardpieces){ return 'boardpiece' }
      return this.boardgame.boardpieces.length > 1 ? 'boardgame' : 'boardpiece' ;
    },
    canvasCalcHeight: function(){
      return this.mode=='boardgame'? this.canvasHeight : this.canvasHeight/3 ;
    },
    canvasCalcWidth: function(){
      return this.mode=='boardgame'? this.canvasWidth : this.canvasWidth/3 ;
    },
    renderBuildsiteFields: function(){
      let self = this;
      if(!this.boardgame.boardpieces){return}
      this.boardgame.boardpieces.map((bp)=>{
        bp.buildsites.map((buildsite)=>{
          var a = [];
          var hits = {};
          self.boardgame.boardpieces.map((bp)=>{
            bp.fields.map((field)=>{
              a = a.concat(field.array.map((tri)=>{
                if( tri.find(t=>Math.round(t[0])==Math.round(buildsite.pos[0])&&Math.round(t[1])==Math.round(buildsite.pos[1])) ){
                  hits[tri.avr().join()] ? hits[tri.avr().join()] += 1 : hits[tri.avr().join()] = 1;
                  return {bp_id: bp.id, refid: field.id, type: field.type, nr: field.number ? field.number : undefined}
                }
                return false
              })).filter(v=>v)
            })
          })
          Object.keys(hits).length < 6 ? a.push({type: 'hamn'}) : '';
          buildsite.fields = a.unique();
        })
      })
      return 'done'
    },
    gridPointerEvents: function(){
      return ['field'].indexOf(this.selected.tool) != -1 ? 'auto': 'none';
    },
    griddotsDisplay: function(){
      return ['road','building'].indexOf(this.selected.tool) != -1 && !this.altPress || this.selected.tool=='move' ? '' : 'none' ;
    },
    griddotsPointerEvents: function(){
      return ['road','building'].indexOf(this.selected.tool) != -1 && !this.altPress || this.selected.tool=='move' ? 'auto' : 'none';
    },
    boardgamePointerEvents: function(){
      return ['edit','hand'].indexOf(this.selected.tool) != -1 || this.altPress ? 'auto': 'none';
    },
    fieldPointerEvents: function(){
      return ['edit','number','move','hand'].indexOf(this.selected.tool) != -1  ? 'auto' : 'none';
    },
    mesh: function(){
      
      let meshArray = [],
          x = this.marginX,
          y = this.marginY,
          index = {x:0,y:0},
          inlet = 0;

      for( y; y < this.canvasHeight; y += this.distY ){
        index.x = 0;
        index.y++;
        inlet = index.y%2 ? 0 : 0-this.distX/2 ;// Varannan gång behöver x-axeln förskjutas 1/2
        for( x = inlet; x < this.canvasWidth; x += this.distX ){
          index.x++;

          meshArray.push({
            p: [ x, y],
            t: [
              [ x               , y              ].round(2),
              [ x + this.distX  , y              ].round(2),
              [ x + this.distX/2, y + this.distY ].round(2)
            ]
          },{
            p: [ x, y],
            t: [
              [ x               , y              ].round(2),
              [ x + this.distX/2, y + this.distY ].round(2),
              [ x - this.distX/2, y + this.distY ].round(2)
            ], 
          })

        }
      }
      return meshArray;
    }
  },

/******************************************/
/*                METHODS                 */


  methods: {

    /*****************************
              MENU / TOOLS
     *****************************/

    selectTool: function(i,d){
      this.saveField();
      if(i==0){
        this.field = this.newField(d.type, d.color)
        this.selected = d;
        console.log('selected tool: '+ this.selected.tool);
        return
      }
      this.selected = this.tools[i];
      console.log('selected tool: '+ this.selected.tool);
    },


    /*****************************
            GRID / MESH
     *****************************/

    _gridTrianlgeMouseOver: function(d){
      if(this.mdown && this.selected.tool != ''){
        if(this.selected.tool == 'field'){ 
          this.altPress ? 
            this.removeField(d) : 
            this.addField(d) ;
        }
      }
    },

    _gridDotMouseDown: function(d){
      this.mdown = true;
      if(this.selected.tool=='road'){
        this.setRoadStart(d)
      }
      if(this.selected.tool == 'move'){
        this.transformStart(d)
      }
    },
    _gridDotMouseOver: function(d){
      if(this.mdown && this.selected.tool=='road'){
        this.setRoadEnd(d)
      }
      if(this.mdown && this.selected.tool == 'move' && d.flip == this.selected.flip){
        this.transformMove(d)
      }
    },
    _gridDotMouseUp: function(d){
      if(this.selected.tool=='road'){
        this.setRoadEnd(d)
        this.saveRoad()
      }
      if(this.selected.tool == 'move' ){
        this.transformEnd(d)
      }
      this.mdown = false;
    },
    _gridDotClick: function(d){
      if(this.selected.tool=='building'){
        this.setBuildsite(d)
      }
    },


    /*****************************
              FUNCTIONS
     *****************************/

    addField: function (d) {
      this.field.array.push(d.t);
    },
    removeField: function (d) {
      const tri = this.field.array.find(t=>t.avr().round().join()==d.t.avr().round().join()),
            i = this.field.array.indexOf(tri);
      if(i!=-1){ 
        this.field.array.splice(i,1)
        if( this.field.array.length == 0 ){
          this.remove(this.boardpiece.fields, this.field)
        }
      }
    },
    saveField: function(){
      if(this.field.array && this.field.array[0]){
        this.update(this.boardpiece.fields, this.field)
        console.log('Field saved: ', this.field)
      }
      this.field = {}
    },
    editField: function(field){
      this.field = field;
      this.selected = this.fieldTools.find(t=>t.type==field.type)
    },
    setFieldNumber: function(obj){
      if(this.selected.tool == "number"){
        let field = this.boardpiece.fields.find(field=>field.id==obj.field.id);
        if(field){
          field.number = 2;
          field.pos = obj.t.avr();
        }
      }
    },
    removeFieldNumber: function(field){
      if(this.selected.tool=="number"){
        if(this.altPress){
          field.number -= 1;
        }else{
          field.number += 1;
        }
        if(field.number <= 1){
          field.number = undefined
          field.pos = []
        }
      }
    },

    // setFieldNumber: function(obj){
    //   if(this.selected.tool == "number"){
    //     let nr = Math.ceil(Math.random()*10+1);
    //     let field = this.boardpiece.fields.find(field=>field.id==obj.field.id);
    //     if(field){
    //       field.number = nr==7 ? 12 : nr;
    //       field.pos = obj.t.avr();
    //     }
    //   }
    // },
    // removeFieldNumber: function(field){
    //   if(this.selected.tool=="number"){
    //     field.number = undefined
    //     field.pos = []
    //   }
    // },

    setRoadStart: function(d){
      this.road = this.newRoad()
      this.road.pos1 = d.p;
      this.road.pos2 = d.p;
    },
    setRoadEnd: function(d){
      this.road.pos2 = d.p;
    },
    saveRoad: function(d){
      this.update(this.boardpiece.roads, this.road)
      console.log('Road saved: ', this.road)
      this.road = {};
    },

    setBuildsite: function(d){
      this.update(this.boardpiece.buildsites, this.newBuildsite(d.p))
      // this.boardpiece.buildsites.push(this.newBuildsite(d.p))
    },

    saveBoard: function(){
      if( this.mode == 'boardpiece' ){ // If just 1 boardpiece it saves boardpiece
        // this.update( this.boardpieces, this.boardpiece ) // Ta bort när Socket används
        this.$socket.emit('saveBoardpiece', this.boardpiece)
      }else if( this.mode == 'boardgame' ){ // If multiple boardpieces it saves boardgame
        // this.update( this.boardgames, this.boardgame ) // Ta bort när Socket används
        this.$socket.emit('saveBoardgame', this.boardgame)
      }
    },
    newBp: function(){
      this.saveBoard()
      this.init()
    },


    /*****************************
                CLASES
     *****************************/

    newBoardgame: function(){
      return {
        id: c4()+"-"+c4()+"-"+c4()+"-"+c4(),
        boardpieces: []
      }
    },
    newBoardpiece: function(){
      return {
        id: c4()+"-"+c4()+"-"+c4()+"-"+c4(),
        fields: [],
        roads: [],
        buildsites: [],
        transform: {
          translate: [0,0],
          rotation: {
            angle: 0,
            origin: [0,0]
          }
        },
      }
    },
    newField: function(type,color){
      return {
        id: c4()+"-"+c4(),
        type: type,
        fill: color,
        array:[],
        number: 0,
        pos: [],
        occupiedBy: 'none',
      }
    },
    newRoad: function(){
      return {
        id: c4()+"-"+c4(),
        pos1: [],
        pos2: [],
      }
    },
    newBuildsite: function(pos = []){
      let self = this;
      return {
        id: c4()+"-"+c4(),
        pos: pos,
        fields: []
      }
    },



    /*****************************
              TRANSFORM
     *****************************/

    transformStart: function(d){
      console.log('tstart')
      if(this.selected.tool=='move'){
        this.mouseStart = d.p;
        this.boardpiece.transform.rotation.origin = d.p;
      }
    },
    transformMove: function(d){
      if(this.selected.tool=='move'){
        console.log('move')
        if(this.altPress){
          const newOrigin = this.boardpiece.transform.rotation.origin[1]+this.boardpiece.transform.translate[1];
          this.boardpiece.transform.rotation.angle = Math.round( (d.p[1]-newOrigin)/this.distY) * Math.PI*2/6 ;
        }else{
          this.boardpiece.transform.translate = [d.p[0]-this.mouseStart[0], d.p[1]-this.mouseStart[1]]
        }
      }
    },
    transformEnd: function(d){
      console.log('tend')
      this.transformBoardpiece()
    },

    
    translation: function(points, translate = this.boardpiece.transform.translate){
      return points.map(point => [ point[0] + translate[0], point[1] + translate[1] ])
    },
    rotate: function(points, rotation = this.boardpiece.transform.rotation){
      return rotation.angle ? points.map(point => [ 
        (point[0]-rotation.origin[0]) * Math.cos(rotation.angle) - (point[1]-rotation.origin[1]) * Math.sin(rotation.angle) + rotation.origin[0], 
        (point[0]-rotation.origin[0]) * Math.sin(rotation.angle) + (point[1]-rotation.origin[1]) * Math.cos(rotation.angle) + rotation.origin[1]
      ]) : points ; 
    },


    transformBoardpiece: function(){
      this.boardpiece.fields.map((field)=>{
        field.array = field.array.map(tri=>this.translation(this.rotate(tri)));
        field.pos = this.translation(this.rotate([field.pos]))[0];
      })
      this.boardpiece.roads.map((road)=>{
        road.pos1 = this.translation(this.rotate([road.pos1]))[0];
        road.pos2 = this.translation(this.rotate([road.pos2]))[0];
      })
      this.boardpiece.buildsites.map((buildsite)=>{
        buildsite.pos = this.translation(this.rotate([buildsite.pos]))[0];
        // buildsite.fields = 
      })
      this.boardpiece.transform = {
        translate: [0,0],
        rotation: {
          angle: 0,
          origin: [0,0]
        }
      }
    },



    /*****************************
                GLOBAL 
     *****************************/

    saveFromTextArea: function(bp){
      console.log('Saveing piece ', bp.name)
      bp = JSON.parse(document.getElementById(bp.id+'_input').value);
      this.boardpieces = this.boardpieces.map(b=>{
        if(b.id==bp.id){
          b = bp
        }
        return b;
      });
    },

    init: function(boardpiece){
      this.boardgame = this.newBoardgame();
      if(boardpiece){
        this.boardgame.boardpieces[0] = this.boardpiece = boardpiece;
      }else{
        this.boardgame.boardpieces[0] = this.boardpiece = this.newBoardpiece();
      }
      console.log(this.boardgame)
    },

    update: function(array,obj){
      let current = array.find((a)=>{ return a.id == obj.id })
      current ? array[array.indexOf(current)] = obj : array.push(obj) ;
    },
    remove: function(array,obj){
      console.log('Remove: ',obj,' in ', array)
      let current = array.find((a)=>{ return a.id == obj.id })
      current ? array.splice(array.indexOf(current),1) : console.log('Error: Could not delete: ',obj,' in ', array) ;
    },

  }, 


/******************************************/
/*                SOCKETS                 */

  sockets: {
    receiveBuilderData: function(data){
      this.boardgames = data.boardgames;
      this.boardpieces = data.boardpieces;
    },
    boardgamesChanges: function(changes){
      if(!changes.old_val){
        this.boardgames.push(changes.new_val)
      }else if(!changes.new_val){
        this.remove(this.boardgames, changes.old_val)
      }else{
        this.boardgames = this.boardgames.map(bg=>bg.id==changes.new_val.id?changes.new_val:bg)
      }
      if(changes.new_val.id==this.boardgame.id){
        this.boardgame = changes.new_val;
      }
    },
    boardpiecesChanges: function(changes){
      if(!changes.old_val){
        this.boardpieces.push(changes.new_val)
      }else if(!changes.new_val){
        this.remove(this.boardpieces, changes.old_val)
      }else{
        this.boardpieces = this.boardpieces.map(bg=>bg.id==changes.new_val.id?changes.new_val:bg)
      }
      if(changes.new_val.id==this.boardpiece.id){
        this.boardpiece = changes.new_val;
      }
    }
  },

/******************************************/
/*                MOUNTED                 */
  

  mounted: function(){
    this.init()

    this.$socket.emit('getDbBuilderData')

    let self = this;
    document.onmousedown = function(){
      self.mdown = true;
    }
    document.onmouseup = function(){
      self.mdown = false;
    }
    document.onkeydown = function(e){ 
      if(e.altKey){ 
        self.altPress = true;
      }
      e.key=='1' ? self.selectTool(0,self.fieldTools[0]):'';
      e.key=='2' ? self.selectTool(0,self.fieldTools[1]):'';
      e.key=='3' ? self.selectTool(0,self.fieldTools[2]):'';
      e.key=='4' ? self.selectTool(0,self.fieldTools[3]):'';
      e.key=='5' ? self.selectTool(0,self.fieldTools[4]):'';
      e.key=='f' ? self.newfieldIsOpen = !self.newfieldIsOpen:'';
      e.key=='e' ? self.selectTool(1):'';
      e.key=='r' ? self.selectTool(2):'';
      e.key=='b' ? self.selectTool(3):'';
      e.key=='n' ? self.selectTool(4):'';
      e.key=='h' ? self.selectTool(5):'';
      e.key=='v' ? self.selectTool(6):'';
    }
    document.onkeyup = function(e){ 
      if(self.altPress){ 
        self.altPress = false; 
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
    Array.prototype.avr = function() {
      return this.reduce((a,b)=>{return [a[0]+b[0],a[1]+b[1]]}).map(v=>v/3)
    }
    Array.prototype.round = function(nr=0) {
      const dec = Math.pow(10,nr);
      return this.map(xy=>Math.round(xy*dec)/dec)
    };

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

  .tra{background-color: #1abc9c;}
  .sten{background-color: #FFFFFF;}
  .olja{background-color: #B697D8;}
  .sad{background-color: #f1c40f;}
  .gras{background-color: #75B96B;}


  html {
    position: relative;
    overflow: auto;
  }  
  body {
    position: relative;
    overflow: auto;
  }
  #bg {
    background-color: white ;
    width: 100%;
    height: 100%;
    margin-top: -40px;
    padding-top: 40px;
  }

  p, h1, h2, h3, h4, h5, h6 {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #000;
    margin-bottom: 0px;
    text-align: left;
  }

  #canvas{
    cursor: crosshair;
  }
  #canvas.move_btn{
    cursor: move;
  }
  #canvas.field_btn{
    cursor: url("/static/paint.gif") 4 16, pointer;
  }
  #canvas.edit_btn{
    cursor: url("/static/pipett.gif") 4 16, pointer;
  }
  #canvas.hand_btn{
    cursor: pointer;
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
  .toolbtn.active .st0 {
    stroke: red; 
    stroke-width: 1; 
  }

  #saved button, #boardgames button {
    display: inline-block;
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
    stroke: rgba(0, 0, 0, 0.05);
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
    stroke: rgba(0, 0, 0, 0.01);
  stroke-width: 20;
  }
  .dot:hover {
    r: 5.5;
    stroke-width: 17; 
    fill: darkgray;
    transition: 0.1s;
  }
  .field circle {
    fill: #606060;
  }
  .number text {
    text-anchor: middle;
    fill: #FFFFFF;
    stroke: white;
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

  .field.passive{ 
    fill-opacity: 0.7;
  }
  .field.passive:hover{ 
    fill-opacity: 0.9;
  }

  .field.active{ 
    fill-opacity: 0.9;
  }

  .field{ 
    fill-opacity: 1;
  }
  .field:hover{ 
    fill-opacity: 1;
  }

  .field.tra polygon{ 
    fill: #1abc9c;
  }
  .field.sten polygon{ 
    fill: lightgray;
  }
  .field.olja polygon{ 
    fill: #B697D8;
  }
  .field.sad polygon{ 
    fill: #f1c40f;
  }
  .field.gras polygon{ 
    fill: #75B96B;
  }

  tt{
    background: #f1f1f1;
  }
</style>

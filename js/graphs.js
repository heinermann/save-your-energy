$(function () {
  $.plot($("#graph-placeholder"), [ [[0, 0], [1, 1], [0.25, 0.75]] ], { yaxis: { max: 1 }, xaxis : {autoscaleMargin: 0.5 } });
});

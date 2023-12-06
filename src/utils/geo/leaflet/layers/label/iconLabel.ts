import * as d3 from 'd3';

interface Options {
  id: string;
  icon: string;
  transform: string;
}

export function drawAreaIcons(options: Options, classes: string) {
  const svg = d3.select('svg.leaflet-zoom-animated');

  const icon = svg.selectAll(`.${classes}-${options.id}`).data([options], (d: any) => {
    return d.id;
  });

  icon.exit().remove();
  icon
    .enter()
    .append('use')
    .attr('class', `icon ${classes} ${classes}-${options.id}`)
    .attr('width', '17px')
    .attr('height', '17px')
    .merge(icon)
    .attr('transform', options.transform)
    .attr('xlink:href', `#${options.icon}`);
}

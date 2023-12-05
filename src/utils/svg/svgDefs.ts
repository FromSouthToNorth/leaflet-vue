import * as d3 from 'd3';

export function drawDefs() {
  const svg = d3.select('#__svg__icons__dom__');
  svg
    .append('marker')
    .attr('id', 'oneway-marker')
    .attr('viewBox', '0 0 10 5')
    .attr('refX', 2.5)
    .attr('refY', 2.5)
    .attr('markerWidth', 2)
    .attr('markerHeight', 2)
    .attr('markerUnits', 'strokeWidth')
    .attr('orient', 'auto')
    .append('path')
    .attr('class', 'oneway-marker-path')
    .attr('d', 'M 5,3 L 0,3 L 0,2 L 5,2 L 5,0 L 10,2.5 L 5,5 z')
    .attr('stroke', 'none')
    .attr('fill', '#000')
    .attr('opacity', '0.75');
}

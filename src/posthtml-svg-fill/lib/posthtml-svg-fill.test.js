const plugin = require('./posthtml-svg-fill');
const t = require('../../../utils').setupPluginTest(plugin);

const matcher = plugin.selectorToMatcher;

describe('selectorToMatcher()', () => {
  it('should support single tag selector', () => {
    expect(matcher('path')).toEqual([
      { tag: 'path' }
    ]);

    expect(matcher('circle,path')).toEqual([
      { tag: 'circle' },
      { tag: 'path' }
    ]);
  });

  it('should trim whitespaces in selectors', () => {
    expect(matcher('         circle,  path ')).toEqual([
      { tag: 'circle' },
      { tag: 'path' }
    ]);
  });

  it('should support #id selector', () => {
    expect(matcher('#circle')).toEqual([
      { attrs: { id: 'circle' } }
    ]);

    expect(matcher('path, #circle')).toEqual([
      { tag: 'path' },
      { attrs: { id: 'circle' } }
    ]);
  });

  it('should support #class selector', () => {
    expect(matcher('.circle')).toEqual([
      { attrs: { class: 'circle' } }
    ]);

    expect(matcher('path, .circle')).toEqual([
      { tag: 'path' },
      { attrs: { class: 'circle' } }
    ]);
  });
});

describe('plugin()', () => {
  it('should do nothing if fill option not provided', () => {
    t(
      null,
      '<path />',
      '<path />'
    );
  });

  it('should process single tag', () => {
    t(
      { fill: '#f00', selector: 'path' },
      '<path /><circle />',
      '<path fill="#f00" /><circle />'
    );
  });

  it('should process multiple tags', () => {
    t(
      { fill: 'red', selector: 'path, circle' },
      '<path /><circle />',
      '<path fill="red" /><circle fill="red" />'
    );
  });

  it('should process #id selectors', () => {
    t(
      { fill: 'red', selector: '#id' },
      '<path id="id" /><circle />',
      '<path id="id" fill="red" /><circle />'
    );
  });

  it('should process .class selectors', () => {
    t(
      { fill: 'red', selector: '.class' },
      '<path class="class" /><circle />',
      '<path class="class" fill="red" /><circle />'
    );
  });

  it('should overwrite fill attribute', () => {
    t(
      { fill: 'blue' },
      '<path fill="red" />',
      '<path fill="blue" />'
    );
  });

  it('should preserve nested tags', () => {
    t(
      { fill: 'red' },
      '<rect><animate /></rect>',
      '<rect fill="red"><animate /></rect>'
    );
  });

  it('should detect if single element used with start & end tags', () => {
    t(
      { fill: 'red' },
      '<path><animateTransform /></path>',
      '<path fill="red"><animateTransform /></path>'
    );
  });
});

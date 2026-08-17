import re

with open('d:/ImageToPDF/frontend/src/pages/Aippt.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

color_funcs = '''
  const updateCustomColor = (field, color) => {
    const layout = slide.customStyles || {};
    onUpdateSlide(currentIndex, {
      ...slide,
      customStyles: { ...layout, [field]: { ...layout[field], color } }
    });
  };

  const updateArrayColor = (field, index, color) => {
    const layout = slide.customStyles || {};
    const arr = [...(layout[field] || [])];
    arr[index] = { ...arr[index], color };
    onUpdateSlide(currentIndex, {
      ...slide,
      customStyles: { ...layout, [field]: arr }
    });
  };
'''

if 'updateCustomColor =' not in content:
    content = content.replace('const updateCustomSize = (field, size) => {', color_funcs + '\n  const updateCustomSize = (field, size) => {')

content = re.sub(
    r'onSizeChange=\{\(s(z)?\) => updateCustomSize\(\"([^\"]+)\", s(z)?\)\}',
    r'onSizeChange={(s\g<1>) => updateCustomSize("\g<2>", s\g<1>)} color={slide.customStyles?.\g<2>?.color} onColorChange={(c) => updateCustomColor("\g<2>", c)}',
    content
)

content = re.sub(
    r'onSizeChange=\{\(s(z)?\) => updateArraySize\(\"([^\"]+)\", (i), s(z)?\)\}',
    r'onSizeChange={(s\g<1>) => updateArraySize("\g<2>", \g<3>, s\g<1>)} color={slide.customStyles?.\g<2>?.[\g<3>]?.color} onColorChange={(c) => updateArrayColor("\g<2>", \g<3>, c)}',
    content
)

with open('d:/ImageToPDF/frontend/src/pages/Aippt.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

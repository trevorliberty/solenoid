const SolenoidParameters = {
  VOLTAGE: 'voltage',
  LENGTH: 'length',
  R0: 'r0',
  RA: 'ra',
  X: 'x',
  FORCE: 'force',
  AWG: 'awg',
  PERMEABILITY: 'relative_permeability',
};

// TODO: Look at this later lol
let previousX;
let previousY;

const renderPage = () => {
  mountInputs();
  createDropDown();
  addAwgSelectOptions();
  dropDownPermeability();
};

const mountInputs = () => {
  let form = document.getElementById('input-submit-form');
  let inputs = createInputs();
  let submit_button =
    '<input class="btn btn-outline-primary" type="submit" value="Calculate">';
  inputs.forEach((input) => {
    form.insertAdjacentHTML('beforeend', input['html']);
  });
  form.insertAdjacentHTML('beforeend', submit_button);
};

// Create a context object to hold data to populate input elements with.
// Input object retrieve values from query string if exists.
const createInputContextObj = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let inputs = [
    {
      name: SolenoidParameters.VOLTAGE,
      symbol: 'V',
      value: urlParams.get('voltage') || '',
      unit: 'volts',
      description: 'Voltage Applied',
      html: '',
    },
    {
      name: SolenoidParameters.LENGTH,
      symbol: 'L',
      value: urlParams.get('length') || '',
      unit: urlParams.get(`${SolenoidParameters.LENGTH}_unit`) || 'mm',
      description: 'Coil Length',
      html: '',
    },
    {
      name: SolenoidParameters.R0,
      symbol: 'r0',
      value: urlParams.get('r0') || '',
      unit: urlParams.get(`${SolenoidParameters.R0}_unit`) || 'mm',
      description: 'Inner Coil Radius',
      html: '',
    },
    {
      name: SolenoidParameters.RA,
      symbol: 'ra',
      value: urlParams.get('ra') || '',
      unit: urlParams.get(`${SolenoidParameters.RA}_unit`) || 'mm',
      description: 'Outer Coil Radius',
      html: '',
    },
    {
      name: SolenoidParameters.X,
      symbol: 'x',
      value: urlParams.get('x') || '',
      unit: urlParams.get(`${SolenoidParameters.X}_unit`) || 'mm',
      description: 'Stroke Position (0 = Stroke Start)',
      html: '',
    },
    {
      name: SolenoidParameters.FORCE,
      symbol: 'F',
      value: urlParams.get('force') || '',
      unit: urlParams.get(`${SolenoidParameters.FORCE}_unit`) || 'N',
      description: 'Force Generated',
      html: '',
    },
    {
      name: SolenoidParameters.AWG,
      symbol: 'AWG',
      value: urlParams.get('awg') || '',
      unit: 'ga',
      description: 'Gauge of Coil Wire',
      html: '',
    },
    {
      name: SolenoidParameters.PERMEABILITY,
      symbol: 'μ',
      value: urlParams.get(SolenoidParameters.PERMEABILITY) || '',
      description: 'Permeability of the Core',
      unit: '',
      html: '',
    },
  ];
  return inputs;
};

const createInputs = () => {
  let inputs = createInputContextObj();
  inputs.forEach((element) => {
      element.html = `
        <div id="input-${element.name}" class="input-group mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text"
              data-toggle="tooltip"
              data-placement="left"
              title="${element.description}"
            >${formatR(element.symbol)}</span>
          </div>   
          ${formatInputs(element)} 
        </div>
      `;
  });

  $(() => {
    $('[data-toggle="tooltip"]').tooltip();
  });
  return inputs;
};

const formatInputs = (element) => {
  let name = element.name;

  // for text type inputs
  let default_input = `
    <input type="text"
      id="input-text-${element.name}"
      class="form-control"
      placeholder="Enter ${element.symbol}"
      value="${element.value}"
    >
    ${formatVariableUnits(element)}
  `;

  // for select type inputs
  let datalist_input = `
    <input id = "input-text-${element.name}"
      class = "form-control"
      list="dropdown-text-${element.name}"
      value="${element.value}" 
      placeholder="Enter ${element.symbol}" 
    >
    <datalist id="dropdown-text-${element.name}">
    </datalist>           
  `
  if (name === SolenoidParameters.AWG) {
    datalist_input += `
      <div class="input-group-append">
        <span class="input-group-text">${element.unit}</span>
      </div>
    `;
  }
  return (name === SolenoidParameters.AWG || name === SolenoidParameters.PERMEABILITY) ? datalist_input : default_input;
};

// formatting for selectable unit values
const formatVariableUnits = (element) => {
  if (element.name === SolenoidParameters.VOLTAGE) {
     let voltage_units = `           
            <div class="input-group-append">
              <span class="input-group-text">volts</span>
            </div> 
    `;
    return voltage_units;
  }
  if (
    element.name === SolenoidParameters.LENGTH ||
    element.name === SolenoidParameters.R0 ||
    element.name === SolenoidParameters.RA ||
    element.name === SolenoidParameters.X
  ) {
    let variable_units = `
            <div class="input-group-append">
              <select id="input-unit-${element.name}" class="input-group-text">
                <option ${element.unit === 'mm' ? 'selected' : ''}>mm</option>
                <option ${element.unit === 'cm' ? 'selected' : ''}>cm</option>
                <option ${element.unit === 'm' ? 'selected' : ''}>m</option>
                <option ${element.unit === 'inch' ? 'selected' : ''}>inch</option>
                <option ${element.unit === 'feet' ? 'selected' : ''}>feet</option>
              </select>
            </div>
    `;
    return variable_units;
  }
  if (element.name === SolenoidParameters.FORCE) {
    let force_units = `
            <div class="input-group-append">
              <select id="input-unit-${element.name}" class="input-group-text">
                <option ${element.unit === 'N' ? 'selected' : ''}>N</option>
                <option ${element.unit === 'lbf' ? 'selected' : ''}>lbf</option>
              </select>
            </div>
    `;
    return force_units;
  }
};

const formatR = (unit) => {
  if (unit == 'r0') return 'r<sub>0</sub>';
  if (unit == 'ra') return 'r<sub>a</sub>';
  return unit;
};

const createDropDown = () => {
  const urlParams = new URLSearchParams(window.location.search);
  let select_X = document.getElementById('x-values-input');
  let select_Y = document.getElementById('y-values-input');
  let inputs = [
    'Voltage',
    'Length',
    SolenoidParameters.R0,
    SolenoidParameters.RA,
    SolenoidParameters.X,
    'Force',
    SolenoidParameters.AWG.toUpperCase(),
    SolenoidParameters.PERMEABILITY,
  ];
  inputs.forEach((element) => {
    let option = document.createElement('option');
    option.text = `${element}`;
    if (element === SolenoidParameters.PERMEABILITY) {
      option.text = 'Relative Permeability';
    }
    option.value = `${element}`;
    option.id = `option-x-${element}`;
    select_X.add(option);
    if (urlParams.get('x_graph') === element.toLowerCase()) {
      select_X.value = element
      previousX = $('#x-values-input')[0].value;
      $(`#option-y-${previousX}`).hide();
      $('#x-value-range-label')[0].textContent = `${element} range`;
      graphRange($('select[name=x-values-input')[0].selectedIndex - 1);
    }
    if (element !== 'AWG') {
      let option1 = document.createElement('option');
      option1.text = `${element}`;
      if (element === SolenoidParameters.PERMEABILITY) {
        option1.text = 'Relative Permeability';
      }
      option1.value = `${element}`;
      option1.id = `option-y-${element}`;
      select_Y.add(option1);
      if (urlParams.get('y_graph') === element.toLowerCase()) {
        select_Y.value = element
        previousY = $('#y-values-input')[0].value;
        $(`#option-x-${previousY}`).hide();
      }
    }
  });

  const stepInput = urlParams.get('step')
  if (stepInput) {
    document.getElementById('step-input').value = stepInput
  }
};

// Populates sample values when sample inputs button is selected
const populateDefaults = () => {
  document.getElementById(
    `input-text-${SolenoidParameters.PERMEABILITY}`
  ).value = '350';
  document.getElementById(`input-text-${SolenoidParameters.VOLTAGE}`).value =
    '5';
  document.getElementById(`input-text-${SolenoidParameters.LENGTH}`).value =
    '27';
  document.getElementById(`input-text-${SolenoidParameters.R0}`).value = '2.3';
  document.getElementById(`input-text-${SolenoidParameters.RA}`).value = '4.5';
  document.getElementById(`input-text-${SolenoidParameters.X}`).value = '0';
  document.getElementById(`input-text-${SolenoidParameters.AWG}`).value = '30';
  document.getElementById(`input-text-${SolenoidParameters.FORCE}`).value = '';
  document.getElementById('x-values-input').value = 'Voltage';
  document.getElementById('y-values-input').value = 'Force';
  document.getElementById('step-input').value = '1';
  previousX = $('#x-values-input')[0].value;
  $(`#option-y-${previousX}`).hide();
  previousY = $('#y-values-input')[0].value;
  $(`#option-x-${previousY}`).hide();
  $('#x-value-range-label')[0].textContent = 'Voltage range';
  graphRange(0);
};

// updates the query string when new calculation is submitted
const updateQueryString = (inputs) => {
  const newUrl = new URL(window.location);
  inputs.forEach( input => {
    newUrl.searchParams.delete(input.name);
    newUrl.searchParams.set(input.name, input.value);
    if (input.unit) {
      newUrl.searchParams.delete(`${input.name}_unit`);
      newUrl.searchParams.set(`${input.name}_unit`, input.unit);
    }
  });
  window.history.pushState({}, document.title, newUrl);
};

const addAwgSelectOptions = () => {
  $('#dropdown-text-awg').append('<option>' + '0000' + '</option>');
  $('#dropdown-text-awg').append('<option>' + '000' + '</option>');
  $('#dropdown-text-awg').append('<option>' + '00' + '</option>');
  for (let i = 0; i < 41; i++) {
    $('#dropdown-text-awg').append('<option>' + i + '</option>');
  }
};

const graphRange = (x_value) => {
  let ranges = [
    { name: 'Voltage', min: '0', max: '99', dMin: '1', dMax: '30', step: '1' },
    { name: 'Length', min: '0', max: '99', dMin: '10', dMax: '30', step: '1' },
    { name: 'r0', min: '0', max: '99', dMin: '2', dMax: '25', step: '0.1' },
    { name: 'ra', min: '0', max: '99', dMin: '3', dMax: '5', step: '0.1' },
    { name: 'x', min: '0', max: '99', dMin: '0', dMax: '10', step: '1' },
    { name: 'Force', min: '0', max: '99', dMin: '5', dMax: '20', step: '1' },
    { name: 'AWG', min: '0', max: '40', dMin: '26', dMax: '40', step: '1' },
    {
      name: 'relative_permeability',
      min: '0',
      max: '200000',
      dMin: '100',
      dMax: '10000',
      step: '100',
    },
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const notLoaded = $('#input-text-ra')[0] === undefined
  if (x_value === 2) {
      ranges[2].max = notLoaded ? urlParams.get('ra') : $('#input-text-ra')[0].value
      ranges[2].dMax = notLoaded ? urlParams.get('ra') : $('#input-text-ra')[0].value
  }
  if (x_value === 4) {
    ranges[4].max = notLoaded ? urlParams.get('length') : $('#input-text-length')[0].value 
    ranges[4].dMax = notLoaded ? urlParams.get('length') : $('#input-text-length')[0].value 
  }
  $('#slider-range').slider({
    range: true,
    min: ranges[x_value].min,
    max: ranges[x_value].max,
    step: urlParams.get('step') ? parseFloat(urlParams.get('step')) : findStep(x_value),
    values: [
      urlParams.get('x_start') ? parseFloat(urlParams.get('x_start')) : ranges[x_value].dMin,
      urlParams.get('x_end') ? parseFloat(urlParams.get('x_end')) : ranges[x_value].dMax
    ],
    slide: (event, ui) => {
      //Maybe add a symbol to the range values so that it can say 7N, or 8 Volts - 20 Volts
      if (event.originalEvent) {
        $('#x-value-range').val(ui.values[0] + ' - ' + ui.values[1]);
      }
    },
  });
  $('#x-value-range').val(
    $('#slider-range').slider('values', 0) +
      ' - ' +
      $('#slider-range').slider('values', 1)
  );
  let slider_min = $('#slider-range').slider('values', 0);
  let slider_max = $('#slider-range').slider('values', 1);
  $('#step-input')[0].max = slider_max - slider_min - 0.01;
};

const findStep = (x_value) => {
  if (x_value === 2 || x_value === 3) {
    return 0.1;
  }
  if (x_value === 7) {
    return 100;
  }
  return 1;
};

const chartDownload = () => {
  let a = document.createElement('a');
  a.href = newChart.toBase64Image();
  a.download = 'chart.png';
  a.click();
};

const dropDownPermeability = () => {
  let items = [
    { name: 'carbon steel', value: '100' },
    { name: 'nickel', value: '100' },
    { name: 'magnetic iron', value: '200' },
    { name: 'ferrite (magnesium manganese zinc)', value: '350' },
    { name: 'electrical steel', value: '4000' },
    { name: 'iron (99.8% pure)', value: '5000' },
    { name: 'permalloy (75% nickel, 21.5% iron)', value: '8000' },
    {
      name: 'mumetal (75% nickel, 2% chromium, 5% copper, 18% iron)',
      value: '200000',
    },
  ];

  items.forEach((item) => {
    let option = document.createElement('option');
    option.text = item.name;
    option.value = item.value;
    $(`#dropdown-text-${SolenoidParameters.PERMEABILITY}`).append(option);
  });
};

(() => {
  $('select[name=x-values-input]').change(() => {
    $(`#option-y-${previousX}`).show();
    previousX = this.value;
    $('#x-value-range-label').text(`${previousX} range:`);
    graphRange($('select[name=x-values-input')[0].selectedIndex - 1);
    $(`#option-y-${previousX}`).hide();
  });

  $('select[name=y-values-input]').change(() => {
    $(`#option-x-${previousY}`).show();
    previousY = this.value;
    $(`#option-x-${previousY}`).hide();
  });
})();

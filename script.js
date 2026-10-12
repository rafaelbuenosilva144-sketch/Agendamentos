// CONFIGURAÇÕES GERAIS E NÚMERO DE DESTINO
const SEU_NUMERO_WHATSAPP = "5563992775987"; 

// TABELA DE HORÁRIOS DISPONÍVEIS POR DIA DA SEMANA
const schedule = {
  0: ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  1: ["07:00", "08:00", "09:00", "10:00", "11:00", "18:50", "19:30", "20:15", "21:00"],
  2: ["07:00", "08:00", "09:00", "10:00", "11:00", "18:50", "19:30", "20:15", "21:00"],
  3: ["18:50", "19:30", "20:15", "21:00"],
  4: ["07:00", "08:00", "09:00", "10:00", "11:00", "18:50", "19:30", "20:15", "21:00"],
  5: ["06:00", "07:00", "08:00"],
  6: ["18:00", "19:00", "20:00", "21:00"]
};

// SELEÇÃO DOS ELEMENTOS DO DOM
const btnOpenServices = document.getElementById('btnOpenServices');
const btnCloseServices = document.getElementById('btnCloseServices');
const servicesModal = document.getElementById('servicesModal');
const selectedServicesList = document.getElementById('selectedServicesList');
const homeServiceCheckbox = document.getElementById('homeService');
const dateInput = document.getElementById('date');
const birthDateInput = document.getElementById('birthDate');
const clientPhoneInput = document.getElementById('clientPhone');
const timeInput = document.getElementById('time');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const totalPrice = document.getElementById('totalPrice');
const btnWhatsApp = document.getElementById('btnWhatsApp');
const btnText = document.getElementById('btnText');

// DESABILITAR DATAS ANTERIORES À DATA ATUAL
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// MÁSCARA AUTOMÁTICA DE TELEFONE E WHATSAPP
clientPhoneInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (value.length > 0) {
    value = value.replace(/^(\d{0,2})/, "($1");
  }
  e.target.value = value;
});

// MÁSCARA AUTOMÁTICA DE DATA DE NASCIMENTO
birthDateInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 8) value = value.slice(0, 8);

  if (value.length > 4) {
    value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,2})/, "$1/$2");
  }
  e.target.value = value;
});

// EVENTOS PARA ABRIR E FECHAR A JANELA MODAL DE SERVIÇOS
if (btnOpenServices && servicesModal) {
  btnOpenServices.addEventListener('click', (e) => {
    e.preventDefault();
    servicesModal.classList.remove('hidden');
  });
}

if (btnCloseServices && servicesModal) {
  btnCloseServices.addEventListener('click', (e) => {
    e.preventDefault();
    servicesModal.classList.add('hidden');
    updateSelectedServicesUI();
  });
}

// ATUALIZAÇÃO VISUAL DOS SERVIÇOS SELECIONADOS E VALOR TOTAL
function updateSelectedServicesUI() {
  const selectedCheckboxes = document.querySelectorAll('input[name="services"]:checked');
  const count = selectedCheckboxes.length;
  const total = calculateTotal();
  const totalFormatted = `R$ ${total.toFixed(2).replace('.', ',')}`;

  if (count > 0) {
    const names = Array.from(selectedCheckboxes).map(cb => cb.value.split('|')[0]);
    selectedServicesList.innerText = "Selecionados: " + names.join(', ');
    
    btnOpenServices.innerHTML = `✓ Serviços Selecionados (${count}) - ${totalFormatted}`;
    btnOpenServices.style.background = "#4caf50";
    btnOpenServices.style.color = "#ffffff";
    btnOpenServices.style.borderColor = "#4caf50";
  } else {
    selectedServicesList.innerText = "Nenhum serviço selecionado";
    btnOpenServices.innerHTML = `Escolher Serviços ➔`;
    btnOpenServices.style.background = "";
    btnOpenServices.style.color = "";
    btnOpenServices.style.borderColor = "";
  }
}

// LÓGICA DE CÁLCULO DOS VALORES DOS SERVIÇOS E TAXA
function calculateTotal() {
  let total = 0;
  const selectedServices = document.querySelectorAll('input[name="services"]:checked');
  
  selectedServices.forEach(checkbox => {
    const price = parseFloat(checkbox.value.split('|')[1]) || 0;
    total += price;
  });

  let extra = homeServiceCheckbox.checked ? parseFloat(homeServiceCheckbox.value) : 0;
  total += extra;

  totalPrice.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
  return total;
}

document.addEventListener('change', function(e) {
  if (e.target.name === 'services' || e.target.id === 'homeService') {
    updateSelectedServicesUI();
  }
});

// CARREGAMENTO DINÂMICO DE HORÁRIOS DISPONÍVEIS POR DIA
dateInput.addEventListener('change', (e) => {
  const selectedDate = new Date(e.target.value + 'T00:00:00');
  const dayOfWeek = selectedDate.getDay();
  const availableTimes = schedule[dayOfWeek] || [];

  timeSlotsContainer.innerHTML = '';
  timeInput.value = '';

  if (availableTimes.length > 0) {
    availableTimes.forEach(time => {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.textContent = time;
      slot.addEventListener('click', () => {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        timeInput.value = time;
      });
      timeSlotsContainer.appendChild(slot);
    });
  } else {
    timeSlotsContainer.innerHTML = '<p class="time-placeholder">Sem horários disponíveis para este dia</p>';
  }
});

// VALIDAÇÃO E ENVIO DO AGENDAMENTO PARA O WHATSAPP
btnWhatsApp.addEventListener('click', function (e) {
  const clientName = document.getElementById('clientName').value;
  const clientPhone = clientPhoneInput.value;
  const clientEmail = document.getElementById('clientEmail').value;
  const birthInput = birthDateInput.value;
  const dateInputValue = dateInput.value;
  const time = timeInput.value;

  const selectedCheckboxes = document.querySelectorAll('input[name="services"]:checked');
  
  if (selectedCheckboxes.length === 0) {
    alert("Por favor, clique em 'Escolher Serviços' e selecione pelo menos uma opção!");
    e.preventDefault();
    return;
  }

  if (!clientName || !clientPhone || !birthInput || !dateInputValue || !time) {
    alert("Por favor, preencha todos os campos obrigatórios e selecione um horário antes de agendar!");
    e.preventDefault();
    return;
  }

  btnText.innerText = "Enviando para o WhatsApp...";
  btnWhatsApp.style.opacity = "0.7";
  btnWhatsApp.style.pointerEvents = "none";

  const selectedServiceNames = Array.from(selectedCheckboxes)
    .map(cb => cb.value.split('|')[0])
    .join(', ');

  const isHome = homeServiceCheckbox.checked ? "Sim (+ R$ 5,00)" : "Não";
  const date = dateInputValue.split('-').reverse().join('/');
  const total = calculateTotal().toFixed(2).replace('.', ',');

  const rawText = 
    `Novo Agendamento!\n\n` +
    `👤 Cliente: ${clientName}\n` +
    `📞 Telefone: ${clientPhone}\n` +
    `✉️ E-mail: ${clientEmail}\n` +
    `🎉 Aniversário: ${birthInput}\n\n` +
    `💅 Serviços Selecionados: ${selectedServiceNames}\n` +
    `🏠 Atendimento a Domicílio: ${isHome}\n` +
    `📅 Data: ${date}\n` +
    `⏰ Horário: ${time}\n` +
    `💰 Valor Total: R$ ${total}`;

  const encodedMessage = encodeURIComponent(rawText)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22")
    .replace(/\*/g, "%2A");

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${5563992775987}&text=${encodedMessage}`;
  
  setTimeout(() => {
    window.location.href = whatsappUrl;
    btnText.innerText = "Agendar Agora";
    btnWhatsApp.style.opacity = "1";
    btnWhatsApp.style.pointerEvents = "auto";
  }, 1000);
  
  e.preventDefault();
});
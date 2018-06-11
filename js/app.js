function getData(url, callbackFunc) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      callbackFunc(this);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function successAjax(xhttp) {
  // Innen lesz elérhető a JSON file tartalma, tehát az adatok amikkel dolgoznod kell
  var userDatas = JSON.parse(xhttp.responseText);

  //könnyeb hivatkozás érdekében:
  var dataBase = userDatas[2].data;

  //adatkezelési functionok:
  var dataHandler = {
    sort: function () {
      var i = dataBase.length
      var swap = false;
      do {
        swap = false;
        for (var j = 0; j < i - 1; j++) {
          if ((parseInt(dataBase[j].cost_in_credits) > parseInt(dataBase[j + 1].cost_in_credits)) || !dataBase[j + 1].cost_in_credits) {
            [dataBase[j], dataBase[j + 1]] = [dataBase[j + 1], dataBase[j]];
            swap = true;
          }
        }
        i--;
      } while (i >= 0 && swap)
    },
    deleteNullConsumables: function () {
      var i = 0;
      while (i < dataBase.length) {
        if (!dataBase[i].consumables) {
          dataBase.splice(i, 1);
          continue;
        }
        i++;
      }
    },
    nullToUnknown: function () {
      for (var i = 0; i < dataBase.length; i++) {
        for (var k in dataBase[i]) {
          if (!dataBase[i][k]) {
            dataBase[i][k] = "unknown";
          }
        }
      }
    },
    stats: function () {
      var container = document.createElement('DIV');
      var outputSoloCrew = document.createElement('SPAN');
      var outputMaxCargo = document.createElement('SPAN');
      var outputSumPax = document.createElement('SPAN');
      var outputMaxLength = document.createElement('IMG');
      var countCrew = 0;
      var maxCargo = 0;
      var sumPax = 0;
      var maxLength = 0;
      for (var i = 0; i < dataBase.length; i++) {
        if (dataBase[i].crew == 1) {
          countCrew++;
        }

        if ((parseInt(dataBase[i].cargo_capacity) > parseInt(dataBase[maxCargo].cargo_capacity)) && dataBase[i].cargo_capacity) {
          maxCargo = i;
        }
        if ((parseInt(dataBase[i].lengthiness) > parseInt(dataBase[maxLength].lengthiness)) && dataBase[i].lengthiness) {
          maxLength = i;
        }
        if (dataBase[i].passengers != "unknown") {
          sumPax += parseInt(dataBase[i].passengers);
        }

      }
      outputSoloCrew.innerText = `Count of solo crew ships: ${countCrew}`;
      outputMaxCargo.innerText = `Model with the largest cargo capacity: ${dataBase[maxCargo].model}`;
      outputSumPax.innerText = `Total amount of passengers: ${sumPax}`;
      outputMaxLength.setAttribute('src', `../img/${dataBase[maxLength].image}`);
      outputMaxLength.setAttribute('alt', `model - ${dataBase[maxLength].model} id - ${dataBase[maxLength].id}`);
      outputMaxLength.addEventListener('error', function () {
        this.setAttribute('src', '../img/default.png')
      });
      container.appendChild(outputSoloCrew);
      container.appendChild(outputMaxCargo);
      container.appendChild(outputSumPax);
      container.appendChild(document.createElement('BR'));
      container.appendChild(outputMaxLength);
      container.id = "stats";
      return container;
    },
    search: function () {
      var value = document.getElementById('search-text').value;
      var index;
      console.log(value);
      for (var i = 0; i < dataBase.length; i++) {
        if (dataBase[i].model.toLowerCase().indexOf(value) > -1) {
          index = i;
          break;
        }
      }

      if (index) {

        displayHandler.displaySearchResult(displayHandler.createDisplayElement(dataBase[index], true));
      } else {
        var tmp = document.createElement('H2');
        tmp.innerText = 404;
        displayHandler.displaySearchResult(tmp);
      }

    }

  }

  //megjelenítési functionok:
  var displayHandler = {
    main: document.getElementsByClassName('shapceship-list')[0],
    createDisplayElement: function (rawObject, search = false) {
      var divObj = document.createElement('DIV');
      var imgObj = document.createElement('IMG');
      var pTitleObj = document.createElement('P');
      var dlObj = document.createElement('DL');
      if (search) {
        divObj.id = "search-result";
      } else {
        divObj.classList.add('spaceship-element');
        divObj.id = rawObject.id;
      }
      imgObj.setAttribute('src', `../img/${rawObject.image}`);
      imgObj.setAttribute('alt', rawObject.model);
      imgObj.addEventListener('error', function () {
        this.setAttribute('src', "../img/default.png")
      })
      pTitleObj.innerHTML = `${rawObject.manufacturer} - ${rawObject.model}<BR>AKA: ${rawObject.denomination}`;
      //csúnya megoldás de szép lesz az output
      var values = ["Crew:", rawObject.crew, "Passenger count:", rawObject.passengers, "Consumables:", rawObject.consumables, "Cargo capacity:", rawObject.cargo_capacity, "Max atmospheric speed:", rawObject.max_atmosphering_speed, "Lenghtiness: ", rawObject.lengthiness, "Cost in Credits:", rawObject.cost_in_credits];
      for (var i = 0; i < values.length; i += 2) {
        var dtTmp = document.createElement('DT');
        var ddTmp = document.createElement('DD');
        dtTmp.innerText = values[i];
        ddTmp.innerText = values[i + 1];
        dtTmp.appendChild(ddTmp);
        dlObj.appendChild(dtTmp);
      }
      divObj.appendChild(imgObj);
      divObj.appendChild(pTitleObj);
      divObj.appendChild(dlObj);
      return divObj;
    },
    contentFill: function () {
      for (var i = 0; i < dataBase.length; i++) {
        this.main.appendChild(this.createDisplayElement(dataBase[i]));
      }
    },
    displayStats: function () {
      this.main.appendChild(dataHandler.stats());
    },
    displaySearchResult: function (element) {
      var ref = document.getElementsByClassName('searchbar')[0];
      if (ref.parentNode.firstChild != ref) {
        ref.parentNode.removeChild(ref.parentNode.firstChild);
      }
      ref.parentNode.insertBefore(element, ref);
    }

  }
  dataHandler.sort();
  dataHandler.deleteNullConsumables();
  dataHandler.nullToUnknown();
  displayHandler.contentFill();
  displayHandler.displayStats();
  //search button bekötése:
  document.getElementById('search-button').addEventListener('click', dataHandler.search);
}
getData('/json/spaceships.json', successAjax);
document.querySelector("title").innerText = "Spaceships";
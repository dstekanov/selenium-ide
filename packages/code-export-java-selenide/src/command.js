// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import {codeExport as exporter} from '@seleniumhq/side-utils'
import location from './location'
import selection from './selection'

export const emitters = {
  addSelection: emitSelect,
  answerOnNextPrompt: skip,
  assert: emitAssert,
  assertAlert: emitAssertAlert,
  assertChecked: emitVerifyChecked,
  assertConfirmation: emitAssertAlert,
  assertEditable: emitVerifyEditable,
  assertElementPresent: emitVerifyElementPresent,
  assertElementNotPresent: emitVerifyElementNotPresent,
  assertNotChecked: emitVerifyNotChecked,
  assertNotEditable: emitVerifyNotEditable,
  assertNotSelectedValue: emitVerifyNotSelectedValue,
  assertNotText: emitVerifyNotText,
  assertPrompt: emitAssertAlert,
  assertSelectedLabel: emitVerifySelectedLabel,
  assertSelectedValue: emitVerifySelectedValue,
  assertValue: emitVerifyValue,
  assertText: emitVerifyText,
  assertTitle: emitVerifyTitle,
  check: emitCheck,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  click: emitClick,
  clickAt: emitClick,
  close: emitClose,
  debugger: skip,
  do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  echo: emitEcho,
  editContent: emitEditContent,
  else: emitControlFlowElse,
  elseIf: emitControlFlowElseIf,
  end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  forEach: emitControlFlowForEach,
  if: emitControlFlowIf,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  open: emitOpen,
  pause: emitPause,
  removeSelection: emitSelect,
  repeatIf: emitControlFlowRepeatIf,
  run: emitRun,
  runScript: emitRunScript,
  select: emitSelect,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
  sendKeys: emitSendKeys,
  setSpeed: emitSetSpeed,
  setWindowSize: emitSetWindowSize,
  store: emitStore,
  storeAttribute: emitStoreAttribute,
  //storeJson: emitStoreJson,
  storeText: emitStoreText,
  storeTitle: emitStoreTitle,
  storeValue: emitStoreValue,
  storeWindowHandle: emitStoreWindowHandle,
  storeXpathCount: emitStoreXpathCount,
  submit: emitSubmit,
  times: emitControlFlowTimes,
  type: emitType,
  uncheck: emitUncheck,
  verify: emitAssert,
  verifyChecked: emitVerifyChecked,
  verifyEditable: emitVerifyEditable,
  verifyElementPresent: emitVerifyElementPresent,
  verifyElementNotPresent: emitVerifyElementNotPresent,
  verifyNotChecked: emitVerifyNotChecked,
  verifyNotEditable: emitVerifyNotEditable,
  verifyNotSelectedValue: emitVerifyNotSelectedValue,
  verifyNotText: emitVerifyNotText,
  verifySelectedLabel: emitVerifySelectedLabel,
  verifySelectedValue: emitVerifySelectedValue,
  verifyText: emitVerifyText,
  verifyTitle: emitVerifyTitle,
  verifyValue: emitVerifyValue,
  waitForElementEditable: emitWaitForElementEditable,
  waitForElementPresent: emitWaitForElementPresent,
  waitForElementVisible: emitWaitForElementVisible,
  waitForElementNotEditable: emitWaitForElementNotEditable,
  waitForElementNotPresent: emitWaitForElementNotPresent,
  waitForElementNotVisible: emitWaitForElementNotVisible,
  waitForText: emitWaitForText,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({command, emitter, emitters})
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!emitters[commandName]
}

function variableLookup(varName) {
  return `vars.get("${varName}").toString()`
}

function variableSetter(varName, value) {
  return varName ? `vars.put("${varName}", ${value});` : ''
}

// TODO: we don't need it or change it
function emitWaitForWindow() {
  const generateMethodDeclaration = name => {
    return `public String ${name}(int timeout) {`
  }
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: 'Thread.sleep(timeout);' },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'Set<String> whNow = driver.getWindowHandles();' },
    {
      level: 0,
      statement:
        'Set<String> whThen = (Set<String>) vars.get("window_handles");',
    },
    { level: 0, statement: 'if (whNow.size() > whThen.size()) {' },
    { level: 1, statement: 'whNow.removeAll(whThen);' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'return whNow.iterator().next();' },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

// TODO: we don't need it or change it
async function emitNewWindowHandling(command, emittedCommand) {
  return Promise.resolve(
    `vars.put("window_handles", driver.getWindowHandles());\n${await emittedCommand}\nvars.put("${
      command.windowHandleName
    }", waitForWindow(${command.windowTimeout}));`
  )
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `assertEquals(vars.get("${varName}").toString(), "${value}");`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(
    `assertThat(Selenide.switchTo().alert().getText(), is("${alertText}"));`
  )
}

function emitAnswerOnNextPrompt(textToSend) {
  return Promise.resolve(
    `Selenide.prompt("${textToSend}");`
  )
}

async function emitCheck(locator) {
  return Promise.resolve(
    `$(${await location.emit(locator)}).setSelected(true);`
  )
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`Selenide.dismiss();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`Selenide.confirm();`)
}

async function emitClick(target) {
  return Promise.resolve(
    `${await location.emit(target)}.click();`
  )
}


// ---------------- DONE ^^^ ----------------


async function emitClose() {
  return Promise.resolve(`driver.close();`)
}

function generateExpressionScript(script) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(Boolean) js.executeScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{level: 0, statement: 'do {'}],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{level: 0, statement: '} else {'}],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} else if (${generateExpressionScript(script)}) {`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{level: 0, statement: `}`}],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      {level: 0, statement: `if (${generateExpressionScript(script)}) {`},
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  const collectionName = exporter.parsers.capitalize(collectionVarName)
  const iteratorName = exporter.parsers.capitalize(iteratorVarName)
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `ArrayList collection${collectionName} = (ArrayList) vars.get("${collectionVarName}");`,
      },
      {
        level: 0,
        statement: `for (int i${iteratorName} = 0; i < collection${collectionName}.size() - 1; i${iteratorName}++) {`,
      },
      {
        level: 1,
        statement: `vars.put("${iteratorVarName}", collection${collectionName}.get(i));`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve({
    commands: [
      {level: 0, statement: `} while (${generateExpressionScript(script)});`},
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target) {
  const commands = [
    {level: 0, statement: `Integer times = ${target};`},
    {level: 0, statement: 'for(int i = 0; i < times; i++) {'},
  ]
  return Promise.resolve({commands, endingLevelAdjustment: 1})
}

function emitControlFlowWhile(script) {
  return Promise.resolve({
    commands: [
      {level: 0, statement: `while (${generateExpressionScript(script)}) {`},
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target) {
  return Promise.resolve(
    `${await location.emit(target)}.doubleClick();`
  )
}

async function emitDragAndDrop(dragged, dropped) {
  return Promise.resolve(
    `${await location.emit(dragged)}.dragAndDropTo(${await location.emit(dropped)});`
  )
}

async function emitEcho(message) {
  const _message = message.startsWith('vars.get') ? message : `"${message}"`
  return Promise.resolve(`System.out.println(${_message});`)
}

async function emitEditContent(locator, content) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `SelenideElement element = ${await location.emit(locator)};`,
    },
    {
      level: 1,
      statement: `Selenide.executeJavaScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element);`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitExecuteScript(script, varName) {
  const result = `js.executeScript("${script.script}"${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script, varName) {
  const result = `js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map(varName => `vars.get("${varName}")`)
    .join(',')}`
}

async function emitMouseDown(locator) {
  return Promise.resolve(
    `Selenide.actions().moveToElement(${await location.emit(locator)}).clickAndHold().perform();`
  )
}

async function emitMouseMove(locator) {
  return Promise.resolve(
    `Selenide.actions().moveToElement(${await location.emit(locator)}).perform();`
  )
}

async function emitMouseOut() {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebElement element = driver.findElement(By.tagName("body"));`,
    },
    {level: 1, statement: 'Actions builder = new Actions(driver);'},
    {level: 1, statement: 'builder.moveToElement(element, 0, 0).perform();'},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitMouseUp(locator) {
  return Promise.resolve(
    `Selenide.actions().moveToElement(${await location.emit(locator)}).release().perform();`
  )
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return Promise.resolve(`Selenide.open(${url});`)
}

async function emitPause(time) {
  const commands = [
    {level: 0, statement: 'try {'},
    {level: 1, statement: `Thread.sleep(${time});`},
    {level: 0, statement: '} catch (InterruptedException e) {'},
    {level: 1, statement: 'e.printStackTrace();'},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitRun(testName) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
}

async function emitRunScript(script) {
  return Promise.resolve(
    `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  )
}

async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `driver.manage().window().setSize(new Dimension(${width}, ${height}));`
  )
}

// TODO: cannot change to Selenide style
async function emitSelect(selectElement, option) {
  return Promise.resolve(
    `$(${await location.emit(selectElement)}).$(${await selection.emit(option)}).click();`
  )
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('Selenide.switchTo().defaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `Selenide.switchTo().frame(${Math.floor(
        frameLocation.split('index=')[1]
      )});`
    )
  } else {
    return Promise.resolve(
      `Selenide.switchTo().frame($(${await location.emit(frameLocation)}));`
    )
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `Selenide.switchTo().window(${windowLocation.split('handle=')[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `Selenide.switchTo().window(${windowLocation.split('name=')[1]});`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [{
          level: 0,
          statement: 'Selenide.switchTo().window(0);'
        }]
      });
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [{
          level: 0,
          statement: `Selenide.switchTo().window(${index});`
        }]
      });
    }
  } else {
    return Promise.reject(
      new Error('Can only emit `select window` using handles')
    )
  }
}

function generateSendKeysInput(value) {
  if (typeof value === 'object') {
    return value
      .map(s => {
        if (s.startsWith('vars.get')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `Keys.${key}`
        } else {
          return `"${s}"`
        }
      })
      .join(', ')
  } else {
    if (value.startsWith('vars.get')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `$(${await location.emit(target)}).setValue(${generateSendKeysInput(value)});`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `System.out.println("\`set speed\` is a no-op in code export, use \`pause\` instead");`
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `String attribute = $(${await location.emit(elementLocator)}).getAttribute("${attributeName}");`,
    },
    {level: 1, statement: `${variableSetter(varName, 'attribute')}`},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitStoreText(locator, varName) {
  const result = `$(${await location.emit(locator)}).text()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(variableSetter(varName, 'Selenide.title()'))
}

async function emitStoreValue(locator, varName) {
  const result = `$(${await location.emit(locator)}).getAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName) {
  return Promise.resolve(variableSetter(varName, 'WebDriverRunner.getWebDriver().getWindowHandle()'))
}

async function emitStoreXpathCount(locator, varName) {
  const result = `$$(${await location.emit(locator)}).size()`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `throw new Error("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `$(${await location.emit(target)}).setValue(${generateSendKeysInput(value)});`
  )
}

async function emitUncheck(locator) {
  return Promise.resolve(
    `$(${await location.emit(locator)}).setSelected(false);`
  )
}

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `$(${await location.emit(locator)}).shouldBe(selected);`
  )
}

//// ----- stopped here

async function emitVerifyEditable(locator) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;',
    },
    {level: 1, statement: 'assertTrue(isEditable);'},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitVerifyElementPresent(locator) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `List<WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});`,
    },
    {level: 1, statement: 'assert(elements.size() > 0);'},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `List<WebElement> elements = driver.findElements(${await location.emit(
        locator
      )});`,
    },
    {level: 1, statement: 'assert(elements.size() == 0);'},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `assertFalse(driver.findElement(${await location.emit(
      locator
    )}).isSelected());`
  )
}

async function emitVerifyNotEditable(locator) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;',
    },
    {level: 1, statement: 'assertFalse(isEditable);'},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    {
      level: 1,
      statement: `assertThat(value, is(not("${exporter.emit.text(
        expectedValue
      )}")));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitVerifyNotText(locator, text) {
  const result = `driver.findElement(${await location.emit(locator)}).getText()`
  return Promise.resolve(
    `assertThat(${result}, is(not("${exporter.emit.text(text)}")));`
  )
}

async function emitVerifySelectedLabel(locator, labelValue) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {level: 1, statement: 'String value = element.getAttribute("value");'},
    {
      level: 1,
      statement: `String locator = String.format("option[@value='%s']", value);`,
    },
    {
      level: 1,
      statement:
        'String selectedText = element.findElement(By.xpath(locator)).getText();',
    },
    {level: 1, statement: `assertThat(selectedText, is("${labelValue}"));`},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifySelectedValue(locator, value) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `assertThat(driver.findElement(${await location.emit(
      locator
    )}).getText(), is("${exporter.emit.text(text)}"));`
  )
}

async function emitVerifyValue(locator, value) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `String value = driver.findElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    {level: 1, statement: `assertThat(value, is("${value}"));`},
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`assertThat(driver.getTitle(), is("${title}"));`)
}

async function emitWaitForElementEditable(locator, timeout) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.elementToBeClickable(${await location.emit(
        locator
      )}));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitWaitForText(locator, text) {
  const timeout = 30000
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.textToBe(${await location.emit(
        locator
      )}, "${text}"));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator, timeout) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.presenceOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({commands})
}

async function emitWaitForElementVisible(locator, timeout) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.visibilityOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator, timeout) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(${await location.emit(
        locator
      )})));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator, timeout) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `WebElement element = driver.findElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: 'wait.until(ExpectedConditions.stalenessOf(element));',
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotVisible(locator, timeout) {
  const commands = [
    {level: 0, statement: '{'},
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(driver, ${Math.floor(
        timeout / 1000
      )});`,
    },
    {
      level: 1,
      statement: `wait.until(ExpectedConditions.invisibilityOfElementLocated(${await location.emit(
        locator
      )}));`,
    },
    {level: 0, statement: '}'},
  ]
  return Promise.resolve({
    commands,
  })
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow },
}

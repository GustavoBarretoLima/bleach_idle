import {test,expect} from '@playwright/test';

test('Phaser keeps input aligned, and city, shop and underground remain connected',async({page})=>{
  const errors=[];page.on('pageerror',error=>{errors.push(error.message);console.error('Page error:',error.message)});
  page.on('console',message=>{if(['warning','error'].includes(message.type()))console.log('Browser:',message.text());});
  await page.goto('/');
  await expect(page.locator('.phaser-world')).toHaveAttribute('data-renderer','phaser');
  const input=page.locator('canvas[tabindex="0"]');
  const output=page.locator('.phaser-world');
  const a=await input.boundingBox(),b=await output.boundingBox();
  for(const key of ['x','y','width','height'])expect(Math.abs(a[key]-b[key])).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Entrar na Loja Urahara',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Loja Urahara',exact:true})).toBeVisible({timeout:30000});
  await page.getByRole('button',{name:'Visitar Urahara · Shinigami'}).click();
  await expect(page.getByRole('dialog')).toBeVisible({timeout:15000});
  await page.getByRole('button',{name:'Fechar',exact:true}).click();
  await page.getByRole('button',{name:'Descer ao subterrâneo',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Câmara subterrânea',exact:true})).toBeVisible({timeout:20000});
  await page.getByRole('button',{name:'Subir para a loja',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Loja Urahara',exact:true})).toBeVisible({timeout:20000});
  await page.getByRole('button',{name:'Sair da loja',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Karakura',exact:true})).toBeVisible({timeout:20000});
  expect(errors).toEqual([]);
});

test('Ten magic slots support rebinding, conflicts, persistence and manual J/K actions',async({page})=>{
  const errors=[];page.on('pageerror',error=>{errors.push(error.message);console.error('Page error:',error.message)});
  await page.goto('/');
  await expect(page.locator('.phaser-world')).toHaveAttribute('data-renderer','phaser');
  await expect(page.locator('.spell-slot')).toHaveCount(10);
  await page.getByText('Configurar magias e teclas',{exact:true}).click();
  const first=page.getByRole('button',{name:'Alterar tecla do slot 1',exact:true});
  await first.click();await first.press('q');await expect(first).toHaveText('Q');
  const second=page.getByRole('button',{name:'Alterar tecla do slot 2',exact:true});
  await second.click();await second.press('q');await expect(page.locator('.binding-message')).toContainText('já está no slot 1');
  await second.press('j');await expect(page.locator('.binding-message')).toContainText('reservadas');await second.press('Escape');
  await page.locator('#spell-9').selectOption('shinigami-0');
  await page.reload();await page.getByText('Configurar magias e teclas',{exact:true}).click();
  await expect(page.getByRole('button',{name:'Alterar tecla do slot 1',exact:true})).toHaveText('Q');
  await expect(page.locator('#spell-9')).toHaveValue('shinigami-0');
  await page.getByText('Configurar magias e teclas',{exact:true}).click();
  await page.getByRole('button',{name:'Patrulhar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Ativar caça automática',exact:true})).toBeVisible();
  const canvas=page.locator('canvas[tabindex="0"]');
  await canvas.press('k');await expect(page.getByRole('button',{name:/K Defendendo/})).toBeVisible();
  await canvas.press('j');await expect(page.getByRole('button',{name:'J Atacar',exact:true})).toBeDisabled();
  expect(errors).toEqual([]);
});

test('A precisely timed K parries an actual Hollow attack',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('bleach-idle-vigilia-v1',JSON.stringify({version:3,controlsVersion:1,classId:'shinigami',inPlaza:false,level:30,xp:0,reishi:18,str:0,vit:200,points:0,legacyBlade:0,legacyArmor:0,form:1,zone:0,unlocked:0,kills:[0,0,0],cleared:[false,false,false],auto:false,bag:[],gear:{blade:null,armor:null},upgrades:{},savedAt:Date.now()})));
  await page.goto('/');
  await expect(page.locator('.phaser-world')).toHaveAttribute('data-renderer','phaser');
  await page.locator('canvas[tabindex="0"]').focus();
  await page.keyboard.down('a');await page.waitForTimeout(350);await page.keyboard.up('a');
  const impact=page.getByRole('progressbar',{name:'Tempo para impacto'});
  await expect.poll(async()=>{
    if(!await impact.count())return 999;
    return Number(await impact.getAttribute('value'));
  },{timeout:15000,intervals:[20]}).toBeLessThanOrEqual(160);
  await page.keyboard.press('k');
  await expect(page.getByText('Parry! Golpe anulado e inimigo atordoado.',{exact:true})).toBeVisible({timeout:3000});
});

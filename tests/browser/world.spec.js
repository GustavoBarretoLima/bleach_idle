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

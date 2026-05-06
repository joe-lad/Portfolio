

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    document.querySelectorAll('.trix-content a').forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }
}

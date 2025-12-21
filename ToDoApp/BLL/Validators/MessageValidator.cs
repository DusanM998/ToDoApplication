using EL.Models.Messages;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Validators
{
    public class MessageValidator : AbstractValidator<Message>
    {
        public MessageValidator()
        {
            RuleFor(x => x.SenderId)
                .NotEmpty()
                .WithMessage("SenderId je obavezan.");

            RuleFor(x => x.ReceiverId)
                .NotEmpty()
                .WithMessage("ReceiverId je obavezan.");

            RuleFor(x => x.Content)
                .NotEmpty()
                .When(x => string.IsNullOrEmpty(x.ImageUrls))
                .WithMessage("Poruka mora imati tekst ili sliku.");

            RuleFor(x => x.Content)
                .MaximumLength(2000)
                .When(x => !string.IsNullOrEmpty(x.Content))
                .WithMessage("Poruka ne sme biti duža od 2000 karaktera.");

            RuleFor(x => x.ImageUrls)
                .Must(BeValidImageList)
                .When(x => !string.IsNullOrEmpty(x.ImageUrls))
                .WithMessage("Neispravan format URL-ova slika.");
        }

        private bool BeValidImageList(string imageUrls)
        {
            return imageUrls
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .All(url => Uri.TryCreate(url, UriKind.Absolute, out _));
        }
    }
}
